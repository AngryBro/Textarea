import { useEffect, useState } from "react"
import { Textarea } from "./Textarea"

export const App = () => {

    const value = JSON.parse(localStorage.getItem("data"))

    const [data, setData] = useState(localStorage.getItem("data") === null ? {text: "", style: {}} : value)

    const save = (value) => {
        localStorage.setItem("data", JSON.stringify(value))
        setData(value)
    }

    useEffect(() => {
        const exec = () => {
            if(localStorage.getItem("data") === null) {
                localStorage.setItem("data", JSON.stringify({text: "", style: {}}))
            }
        }
        exec()
    }, [])

    return <div>
        <div className="container">
            <h1>Текст, который виден пользователю</h1>
            <Textarea disabled={true} value={data} />
            <h1>Редактирование текста с сохранением в localStorage</h1>
            <Textarea disabled={false} value={data} setValue={save} />
        </div>
    </div>
}