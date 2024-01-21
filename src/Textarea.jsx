import { useRef, useState } from "react"
import "./Textarea.css"


export const Textarea = ({value, setValue = () => 1, disabled = false}) => {


    const zeroStyle = {
        fontSize: "12pt",
        color: "black",
        fontFamily: "Arial",
        italic: false,
        bold: false,
        underlined: false,
        crossed: false,
    }

    const copy = (obj) => JSON.parse(JSON.stringify(obj))

    const unpackStyle = (s, len) => {
        const codes = []
        for(let i = 0; i < len; i++) {
            codes.push(copy(zeroStyle))
        }
        let last = zeroStyle
        for(let i = 0; i < codes.length; i++) {
            if(i in s) {
                last = s[i]
            }
            codes[i] = copy(last)
        }
        // codes.push(copy(zeroStyle))
        return codes
    }

    const [range, setRange] = useState([0,0])
    const [styles, setStyles] = useState(unpackStyle(value.style, value.text.length))
    const [txt, setTxt] = useState(value.text)
    const [fontFamily, setFontFamily] = useState("")
    const [fontSize, setFontSize] = useState("")
    const [color, setColor] = useState("")
    const [empty, setEmpty] = useState(value.text.length === 0)

    const area = useRef()

    const updateInfo = (r1, r2) => {
        const flags = {
            fontSize: true,
            fontFamily: true,
            color: true
        }
        const callbacks = {
            fontSize: setFontSize,
            fontFamily: setFontFamily,
            color: setColor
        }
        if(r1 === undefined) {
            for(let flag in callbacks) {
                callbacks[flag]("")
            }
            return
        }
        for(let i = r1; i < r2; i++) {
            for(let flag in flags) {
                if(styles[i][flag] !== styles[r1][flag]) {
                    flags[flag] = false
                }
            }
        }
        if(r2 > r1) {
            for(let flag in callbacks) {
                callbacks[flag](flags[flag] ? styles[r1][flag] : "")
            }
        }
        else if(r1 > 0) {
            for(let flag in callbacks) {
                callbacks[flag](styles[r1 - 1][flag])
            }
        }
        else {
            for(let flag in callbacks) {
                callbacks[flag](zeroStyle[flag])
            }
        }
    }

    const selectHandle = (e) => {
        let sel = window.getSelection()
        let text = sel.toString()
        let rng = sel.getRangeAt(0)
        sel.collapseToStart()
        sel.extend(e.target, 0)
        let start = sel.toString().length
        let end = start + text.length
        sel.removeAllRanges()
        sel.addRange(rng)
        updateInfo(start, end)
        console.log(start, end)
        setRange([start, end])
    }

    const innerText = (html) => {
        if(html.slice(0, 4) === "<br>") {
            html = html.slice(4)
        }
        html = html.replace(/<span[\w\-"=:;.\d,() ]*>/g, "")
        .replace(/<font[\w\-"=:;.\d,() ]*>/g, "")
        .replace(/<div><br>/g, "\n")
        .replace(/<\/span>/g, "")
        .replace(/<\/font>/g, "")
        .replace(/<br>/g, "\n")
        .replace(/<\/div>/g, "")
        .replace(/<div>/g, "\n")
        .replace(/&nbsp;/g, " ")
        return html
    }


    const packStyle = (codes) => {
        const new_style = {}
        new_style[0] = codes[0]
        for(let i = 1; i < codes.length; i++) {
            if(JSON.stringify(codes[i]) !== JSON.stringify(codes[i - 1])) {
                new_style[i] = codes[i]
            }
        }
        return new_style
    }

    const parse = () => {
        let html = ""
        const styleString = ({fontSize, fontFamily, color, italic, bold, underlined, crossed}) => {
            return "" 
            + `font-size: ${fontSize};`
            + `font-family: ${fontFamily};`
            + `color: ${color};`
            + `font-weight: ${bold ? "bold": "normal"};`
            + `text-decoration: ${underlined ? "underline" : crossed ? "line-through" : "none"};`
            + `font-style: ${italic ? "italic" : "normal"}`
        }
        let styleFlag = false
        for(let i = 0; i < value.text.length; i++) {
            if(i in value.style) {
                if(styleFlag) {
                    html +=  `</span>`
                    styleFlag = false
                }
                html += `<span style="${styleString(value.style[i])}">`
                styleFlag = true
            }
            if(value.text[i] === "\n") {
                html += "<br>"
            }   
            else {
                html += value.text[i]
            }
        }
        return html
    }

    const addStyle = (obj) => {
        const stylesCopy = styles.slice()
        const [r1, r2] = range
        let cancel = true
        const key = Object.keys(obj)[0]
        const val = obj[key]
        for(let i = r1; i < r2; i++) {
            if(stylesCopy[i][key] !== val) {
                cancel = false
                stylesCopy[i][key] = val
            }
        }
        if(cancel) {
            for(let i = r1; i < r2; i++) {
                stylesCopy[i][key] = zeroStyle[key]
            }
        }
        setStyles(stylesCopy)
        save(stylesCopy)
    }


    const handleInput = e => {
        const newText = innerText(e.target.innerHTML)
        const dLen = newText.length - txt.length
        setTxt(newText)
        // console.log(newText.length)
        if(!empty && (newText.length === 0)) {
            setEmpty(true)
        }
        const stylesCopy = styles.slice()
        const [r1, r2] = range
        switch (e.nativeEvent.inputType) {
            case "deleteContentBackward":
                
                if(r2 > r1) {
                    stylesCopy.splice(r1, r2 - r1)
                }
                else if(r1 > 0) {
                    stylesCopy.splice(r1 - 1, 1)
                }

                break;
            case "deleteByCut":
                
                if(r2 > r1) {
                    stylesCopy.splice(r1, r2 - r1)
                }

                break;
            case "deleteContentForward":
                
                if(r2 < txt.length) {
                    stylesCopy.splice(r2, 1)
                }

                break;
        
            default:
                let styleToPaste = zeroStyle
                if(r1 > 0) {
                    styleToPaste = stylesCopy[r1 - 1]
                }
                const stylesToPaste = []
                for(let i = 0; i < r2 - r1 + dLen; i++) {
                    stylesToPaste.push(copy(styleToPaste))
                }
                stylesCopy.splice(r1, r2 - r1, ...stylesToPaste)
                break;
        }
        setStyles(stylesCopy)
    }

    
    const save = (s = undefined) => {
        if(empty && txt.length > 0) {
            setEmpty(false)
        }
        setValue({text: txt, style: packStyle(s === undefined ? styles : s)})
        // updateInfo()
    }

    const handleFontFamily = (e) => {
        const fF = e.target.value
        setFontFamily(fF)
        addStyle({fontFamily: fF})
    }

    const FONTS = [
        "Arial",
        "Calibri",
        "Times New Roman",
    ]

    const handleFontSize = e => {
        const fS = e.target.value
        setFontSize(fS)
        addStyle({fontSize: fS})
    }

    const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 40, 50, 60]

    const handleColor = e => {
        const clr = e.target.value
        setColor(clr)
        addStyle({color: clr})
    }

    const COLORS = [
        "black",
        "red",
        "blue",
        "yellow",
        "green",
        "grey"
    ]

    const bold = () => {
        addStyle({bold: true})
    }

    const italic = () => {
        addStyle({italic: true})
    }

    const underlined = () => {
        addStyle({underlined: true})
    }

    const crossed = () => {
        addStyle({crossed: true})
    }

    return <div className="textarea-container">
        <div className={`textarea-tools-container ${disabled?"textarea-tools-hidden":""}`}>
            <div className="textarea-tool" onClick={bold}><b>B</b></div>
            <div className="textarea-tool" onClick={italic}><i>i</i></div>
            <div className="textarea-tool" onClick={underlined}><u>u</u></div>
            <div className="textarea-tool" onClick={crossed}><span style={{textDecoration:"line-through"}}>w</span></div>
            <div className="textarea-tool">
                <select onChange={handleFontFamily} value={fontFamily}>
                    {
                        FONTS.map(font => 
                            <option style={{fontFamily: font}} key={font} value={font}>
                                {font}
                            </option>   
                        )
                    }
                    <option disabled={true} value=""></option>
                </select>
            </div>
            <div className="textarea-tool">
                <select value={fontSize} onChange={handleFontSize}>
                    {
                        FONT_SIZES.map(font => 
                            <option key={font} value={`${font}pt`} >{font}</option>    
                        )
                    }
                    <option disabled={true} value=""></option>
                </select>
            </div>
            <div className="textarea-tool">
                <select style={{color: color, fontWeight: "bold"}} value={color} onChange={handleColor}>
                    {
                        COLORS.map(clr => 
                            <option style={{color: clr, fontWeight: "bold"}} key={clr} value={clr}>
                                Aa
                            </option>   
                        )
                    }
                    <option disabled={true} value=""></option>
                </select>
            </div>
        </div>
        <div 
            ref={area}  
            className={`textarea-area textarea-area-${disabled ? "noborder" : "border"}`}
            style={empty ? {fontFamily:"Arial"} : {}}
            onInput={handleInput}
            onBlur={() => save()}
            onSelect={selectHandle} 
            contentEditable={!disabled} 
            dangerouslySetInnerHTML={{__html: parse()}} 
        />
    </div>
}