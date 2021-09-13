import { Button } from "@material-ui/core"
import { FunctionComponent, useCallback, useMemo, useState } from "react"

type Props = {
    onSubmit: (value: string) => void
    buttonLabel?: string
}

const SubmitText: FunctionComponent<Props> = ({onSubmit, buttonLabel='Submit'}) => {
    const [value, setValue] = useState<string>('')
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setValue(e.target.value as string)
    }, [])
    const handleSubmit = useCallback(() => {
        onSubmit(value)
    }, [onSubmit, value])
    const okayToSubmit = useMemo(() => (
        value ? true : false
    ), [value])
    return (
        <span>
            <input type="text" value={value} onChange={handleChange} />
            <Button onClick={handleSubmit} disabled={!okayToSubmit}>{buttonLabel}</Button>
        </span>
    )
}

export default SubmitText