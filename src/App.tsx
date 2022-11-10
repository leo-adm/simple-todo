import { FormEvent, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './styles/global.css'

interface ToDo {
  id: number,
  todo: string,
  done: boolean
}

const baseQueryClient = new QueryClient()
const API_URL = import.meta.env.DEV ? "http://localhost:3000" : import.meta.env.VITE_API_URL

function App() {
  return (
    <QueryClientProvider client={baseQueryClient}>
      <Todos />
    </QueryClientProvider>
  )
}

function Todos() {
  const [newToDo, setNewToDo] = useState<string>("")
  const queryClient = useQueryClient()

  const query = useQuery<ToDo[]>(
    { 
      queryKey: ['todos'], 
      queryFn: () => {
        const promise = fetch(`${API_URL}/todos`)
          .then(res => res.json())
        return promise
      },

    }
  )

  const todos = useMemo(() => {
    if(query.isLoading || !query.data) return []
    return query.data.filter(x => !x.done)
  }, [query.data])

  const doneTodos = useMemo(() => {
    if(query.isLoading || !query.data) return []
    return query.data.filter(x => x.done)
  }, [query.data])


  const createMutation = useMutation({
    mutationFn: (newTodo: Partial<ToDo>) => {
      const reqOptions: RequestInit = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      }

      const promise = fetch(`${API_URL}/todos`, reqOptions)
        .then(res => res.json())

      return promise
    },
    onSuccess: () => {
      setNewToDo("")
      queryClient.invalidateQueries(['todos'])
    },
    onError: () => {
      alert('An error occurred while trying to add To Do')
    }
  })

  const updateMutation = useMutation({
    mutationFn: (todo: Partial<ToDo>) => {
      const reqOptions: RequestInit = {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo)
      }

      const promise = fetch(`${API_URL}/todos/${todo.id}`, reqOptions)
        .then(res => res.json())

      return promise
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todos'])
    },
    onError: () => {
      alert('An error occurred while trying to update To Do')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      const reqOptions: RequestInit = {
        method: "DELETE"
      }

      const promise = fetch(`${API_URL}/todos/${id}`, reqOptions)
        .then(res => res.json())

      return promise
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todos'])
    },
    onError: () => {
      alert('An error occurred while trying to delete To Do')
    }
  })

  function handleCreateTodo(event: FormEvent){
    event.preventDefault()

    const payload: Partial<ToDo> = {
      todo: newToDo,
      done: false
    }

    createMutation.mutate(payload)
  }

  function handleUpdateTodo(todo: ToDo){
    const payload = {
      ...todo,
      done: !todo.done
    }

    updateMutation.mutate(payload)
  }

  function handleDeleteTodo(id: number){
    deleteMutation.mutate(id)
  }

  if(query.isLoading){
    return <div className="h-screen flex items-center justify-center text-4xl">
      Loading...
    </div>
  }

  if(query.isError){
    return <div className="h-screen flex items-center justify-center text-4xl">
      An error occurred while fetching data
    </div>
  }

  return (
    <div className="p-8 min-h-screen flex flex-col items-center gap-y-8">
      <h1 className="text-4xl font-semibold text-teal-300">Simple To Do</h1>

      <form onSubmit={handleCreateTodo} className="flex flex-col items-center gap-1">
        <label className="self-start"
          htmlFor="newTodoInput">
          New Todo:
        </label>
        <input className="text-black py-0.5 px-1 rounded focus:outline-none"
          id="newTodoInput" 
          value={newToDo} 
          onChange={e => setNewToDo(e.target.value)}
          placeholder="Task description"
        />
        <button className="px-8 py-0.5 rounded bg-teal-300 hover:bg-teal-200 text-xl text-black duration-200 disabled:bg-teal-900" 
          type="submit" 
          disabled={createMutation.isLoading}>
          Create
        </button>
      </form>

      <div className="flex gap-4 w-full">
        <div className="bg-white w-full h-px self-center mt-2"></div>
        <h2 className="text-3xl">Todos</h2>
        <div className="bg-white w-full h-px self-center mt-2"></div>
      </div>

      <ul className="p-1 max-w-3xl bg-zinc-800 flex flex-col gap-y-1 text-xl">
        {
          todos.map(todo => <li key={todo.id} className="bg-zinc-900 flex flex-col p-2 gap-y-1">
            <span>{todo.todo}</span>
            <div className="text-base flex self-end gap-x-1">
              <button className="text-teal-400 hover:text-teal-300"
                type="button" 
                onClick={() => handleUpdateTodo(todo)}>
                Mark as done
              </button>
              <button className="text-red-400 hover:text-red-500"
                type="button" 
                onClick={() => handleDeleteTodo(todo.id)}>
                Delete
              </button>
            </div>
          </li>)
        }
      </ul>
      
      <div className="flex gap-4 w-full">
        <div className="bg-white w-full h-px self-center mt-2"></div>
        <h2 className="text-3xl">Done</h2>
        <div className="bg-white w-full h-px self-center mt-2"></div>
      </div>

      {
        doneTodos.length > 0 ?
        <ul className="max-w-3xl flex flex-col gap-y-1 text-xl">
          {
            doneTodos.map(todo => <li key={todo.id} className="bg-zinc-800 flex flex-col p-2 gap-y-1 rounded-xl">
              <span>{todo.todo}</span>
              <div className="text-base flex self-end gap-x-1">
                <button className="text-teal-400 hover:text-teal-300"
                  type="button" 
                  onClick={() => handleUpdateTodo(todo)}>
                  Mark as undone
                </button>
                <button className="text-red-400 hover:text-red-500"
                  type="button" 
                  onClick={() => handleDeleteTodo(todo.id)}>
                  Delete
                </button>
              </div>
            </li>)
          }
        </ul> :
        <span className="text-base">There is no Todo Item marked as done</span>
      }
    </div>
  )
}

export default App