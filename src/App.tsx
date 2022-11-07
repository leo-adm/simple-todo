import { FormEvent, useEffect, useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface ToDo {
  id: number,
  todo: string,
  done: boolean
}

const queryClient = new QueryClient()
const API_URL = import.meta.env.DEV ? "http://localhost:3000" : import.meta.env.VITE_API_URL

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
      refetchOnWindowFocus: false
    }
  )

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
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setNewToDo("")
    },
    onError: () => {
      alert('An error occurred while trying to add To Do')
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
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: () => {
      alert('An error occurred while trying to delete To Do')
    }
  })

  function handleCreateToDo(event: FormEvent){
    event.preventDefault()

    const payload: Partial<ToDo> = {
      todo: newToDo,
      done: false
    }

    createMutation.mutate(payload)
  }

  function handleDeleteToDo(id: number){
    deleteMutation.mutate(id)
  }

  if(query.isLoading){
    return <div>Loading...</div>
  }

  if(query.isError){
    return <div>An error occurred while fetching data</div>
  }

  return (
    <div>
      <h1>Simple To Do</h1>

      <form onSubmit={handleCreateToDo}>
        <label htmlFor="newTodoInput">New To Do:</label>
        <input id="newTodoInput" value={newToDo} onChange={e => setNewToDo(e.target.value)}/>
        <button type="submit" disabled={createMutation.isLoading}>Add</button>
      </form>

      <ul>
        {
          query.data.map(todo => <li key={todo.id}>
            <span>{todo.todo}</span>
            <button type="button" onClick={() => handleDeleteToDo(todo.id)}>X</button>
          </li>)
        }
      </ul>
    </div>
  )
}

export default App