import { FormEvent, useEffect, useRef, useState } from "react"

interface ToDo {
  id: number,
  todo: string,
  done: boolean
}

const API_URL = import.meta.env.DEV ? "http://localhost:3000" : import.meta.env.VITE_API_URL

function App() {
  const newTodoInputRef = useRef<HTMLInputElement>(null)
  const [todos, setTodos] = useState<ToDo[]>([])

  useEffect(() => {
    fetch(`${API_URL}/todos`)
      .then(res => res.json())
      .then((data: ToDo[]) => setTodos(data))
  }, [])

  function handleCreateToDo(event: FormEvent){
    event.preventDefault()
    
    const value = newTodoInputRef.current?.value
    if(!value) return

    const payload: Partial<ToDo> = {
      todo: value,
      done: false
    }

    const reqOptions: RequestInit = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }

    fetch(`${API_URL}/todos`, reqOptions)
      .then(res => res.json())
      .then((data: ToDo) => setTodos(curr => [data, ...curr]))
      .catch(() => alert('Something went wrong when trying to create To Do'))

    newTodoInputRef.current.value = ""
  }

  function handleDeleteToDo(id: number){
    const reqOptions: RequestInit = {
      method: "DELETE"
    }

    fetch(`${API_URL}/todos/${id}`, reqOptions)
      .then(res => res.json())
      .then(() => setTodos(curr => curr.filter(x => x.id !== id)))
      .catch(() => alert('Something went wrong when trying to delete To Do'))
  }

  return (
    <div>
      <h1>Simple To Do</h1>

      <form onSubmit={handleCreateToDo}>
        <label htmlFor="newTodoInput">New To Do:</label>
        <input id="newTodoInput" ref={newTodoInputRef}/>
        <button type="submit">Add</button>
      </form>

      <ul>
        {
          todos.map(todo => <li key={todo.id}>
            <span>{todo.todo}</span>
            <button type="button" onClick={() => handleDeleteToDo(todo.id)}>X</button>
          </li>)
        }
      </ul>
    </div>
  )
}

export default App