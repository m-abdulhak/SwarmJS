import React from 'react';

export default function ProgrammingPane(props) {
    const [formData, setFormData] = React.useState(
        {setup: "", loop: ""}
    )

    function handleChange(event) {
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [event.target.name]: event.target.value
            }
        })
    }

    function handleSubmit(event) {
        event.preventDefault()
        props.callback(formData.setup, formData.loop);
        //console.log(formData)
    }

    return (
        <div className="programmingPane">
            <div>
                <label>Setup:</label>
                <textarea 
                    rows="2"
                    cols="50"
                    value={formData.setup}
                    placeholder="Code executed on initialization, for every robot."
                    onChange={handleChange}
                    name="setup"
                />
            </div>

            <div>
                <label>Loop: Code executed on every iteration, for every robot.</label>
                <textarea 
                    rows="20"
                    cols="50"
                    value={formData.loop}
                    placeholder="Code executed on every iteration, for every robot."
                    onChange={handleChange}
                    name="loop"
                />
            </div>

            <button onClick={handleSubmit}>Apply</button>
        </div>
    )
}