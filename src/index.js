import React from 'react';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({}, this.props);
        this.state.meta = this.state.meta || { fields: [], labels: {}, css: {}, types: {}, placeholders: {} }; // assign or initialize metadata
        this.state.values = this.state.meta.attributes || {}; //default values of form elements
        this.state.inputTypes = ['text', 'number', 'password']; // A list of types of input whose elements will be created through this.getInputElement functio
        this.onChange = this.onChange.bind(this); // bind onChange function to this context
        this.onSubmit = this.onSubmit.bind(this); // bind onSubmit function to this context
    }
    render() {
        return (
            <form onSubmit={this.onSubmit}>
                {this.state.meta.fields.map(field => {
                    return this.getElement(field);
                })}
                {this.getSubmitButtonElement()}
            </form>
        );
    }
    /**
     * onSubmit function will be called when a form is to be submitted
     * @param {Event} event 
     */
    onSubmit(event) {
        event.preventDefault();
    }
    /**
     * getDate function will give you an object of values keyed by field names
     * @returns {Object}
     */
    getData() {
        return this.state.values;
    }
    /**
     * whenever a value in form changed, this function gets called to update
     * the state.
     * @param {Event} event 
     */
    onChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState(state => {
            if (target.multiple === true) { //this is specifically to handle multiselect
                let selectedOptionsValues = [];
                for (let option of target.selectedOptions){
                    selectedOptionsValues.push(option.value);
                }
                state.values[name] = selectedOptionsValues;
            } else {
                state.values[name] = value;
            }
            return state;
        });
    }
    
    /**
     * override this function give button of your own choice
     * @returns {JSX} submit button element
     */
    getSubmitButtonElement() {
        return (
            <button type="submit" key="submit-button">Save</button>
        );
    }
    /**
     * this function returns a group of label and input/select/textarea elements
     * @param {String} //field name
     * @returns {JSX}
     */
    getElement(fieldName) {
        let element;
        if (this.state.inputTypes.includes(this.state.meta.types[fieldName].toLowerCase())) {
            element = this.getInputElement(fieldName);
        } else if (this.state.meta.types[fieldName].toLowerCase() === 'textarea') {
            element = this.getTextareaElement(fieldName);
        } else if (this.state.meta.types[fieldName].toLowerCase() === 'select') {
            let isMultiSelect = Array.isArray(this.state.meta.multiSelect) && this.state.meta.multiSelect.includes(fieldName);
            element = this.getSelectElement(fieldName, isMultiSelect);
        } else if (this.state.meta.types[fieldName].toLowerCase() === 'radio') {
            element = this.getRadioElements(fieldName);
        } else if (this.state.meta.types[fieldName].toLowerCase() === 'checkbox') {
            return this.getCheckboxElement(fieldName);
        }
        let labelElement = this.getLabelElement(fieldName);
        return this.groupLabelAndElement(labelElement, element, fieldName);
    }
    /**
     * this function takes two JSX elements and and group them in another JSX element
     * override this function if you want to give your own choice of group element
     * @param {JSX} label
     * @param {JSX} element
     * @param {String} key is used to give group tag a key
     * @returns {JSX} a group of label and input/select/textarea elements
     */
    groupLabelAndElement(label, element, key) {
        return (
            <div className={this.getGroupCSS()} key={this.getGroupCSS() + '-' + key}>
                {label}
                {element}
            </div>
        );
    }
    /**
     * this function creates and returns a JSX of Label element
     * override this function to customize it according to your need
     * @param {String} fieldName 
     * @returns {JSX}
     */
    getLabelElement(fieldName) {
        return (
            <label
                htmlFor={fieldName}
                key={'label-' + fieldName}
                className={this.getLabelCSS()}
            >{this.state.meta.labels[fieldName]}</label>
        );
    }
    /**
     * this function creates and returns a JSX of input element
     * override this function to fit your need
     * @param {String} fieldName 
     * @returns {JSX}
     */
    getInputElement(fieldName) {
        return (
            <input
                key={'input-' + fieldName}
                id={fieldName}
                type={this.state.meta.types[fieldName].toLowerCase()}
                className={this.state.meta.css[fieldName] || this.getDefaultCSS()}
                name={fieldName} id={fieldName} key={fieldName}
                value={this.state.values[fieldName]}
                placeholder={this.state.meta.placeholders[fieldName]}
                onChange={this.onChange}
            />
        );
    }
    /**
     * this function returns an array of JSX of radio elements
     * @param {String} fieldName 
     * @returns {Array} array of JSX elements
     */
    getRadioElements(fieldName) {
        return this.state.meta.options[fieldName].map(radio => this.getRadioElement(fieldName, radio));
    }
    /**
     * this function creates and returns a JSX of radio element
     * override this function to fit your need
     * @param {String} fieldName 
     * @param {Object} radio
     * {name: 'Some Name', value: 'some_value'} 
     * @returns {JSX} radio input and label grouped in a div tag
     */
    getRadioElement(fieldName, radio) {
        return <div
            key={'div-radio-' + radio.name}
            className={this.getRadioElementCSS()}
        >
            {this.getRadioInputElement(fieldName, radio)}
            {this.getRadioLabelElement(radio)}
        </div>
    }
    /**
     * this function creates and returns a JSX of checkbox element
     * override this function to fit your need
     * @param {String} fieldName  
     * @returns {JSX} checkbox input and label grouped in a div tag
     */
    getCheckboxElement(fieldName) {
        return <div
            key={'div-checkbox-' + fieldName}
            className={this.getRadioElementCSS()}
        >
            {this.getCheckboxInputElement(fieldName)}
            {this.getCheckboxLabelElement(fieldName)}
        </div>
    }

    /**
     * this function creates and returns a JSX input element of radio
     * override it to fit your need
     * @param {String} fieldName 
     * @param {Object} radio
     * {name: 'Some Name', value: 'some_value'}
     * @returns {JSX} 
     */
    getRadioInputElement(fieldName, radio) {
        return <input
            key={'radio-' + radio.name}
            id={radio.name}
            type="radio"
            name={fieldName}
            className={this.state.meta.css[fieldName] || this.getRadioInputCSS()}
            value={radio.value}
            onChange={this.onChange}
        ></input>
    }
    /**
     * this function creates and returns a JSX input element of checkbox
     * override it to fit your need
     * @param {String} fieldName
     * @returns {JSX} 
     */
    getCheckboxInputElement(fieldName) {
        return <input
            key={'checkbox-' + fieldName}
            id={fieldName}
            type="checkbox"
            name={fieldName}
            className={this.state.meta.css[fieldName] || this.getCheckboxInputCSS()}
            value={this.state.values[fieldName]}
            onChange={this.onChange}
        ></input>
    }

    /**
     * this function creates and returns a JSX of label element to be used for
     * radio inputs
     * override it to fit your need
     * @param {Object} radio
     * {name: 'Some Name', value: 'some_value'} 
     * @returns {JSX}
     */
    getRadioLabelElement(radio) {
        return <label
            key={"radio-label-" + radio.name}
            htmlFor={radio.name}
            className={this.getRadioLabelCSS()}
        >
            {radio.name}
        </label>
    }

    /**
     * this function creates and returns a JSX of label element to be used for
     * checkbox inputs
     * override it to fit your need
     * @param {String} fieldName 
     * @returns {JSX}
     */
    getCheckboxLabelElement(fieldName) {
        return <label
            key={"checkbox-label-" + fieldName}
            htmlFor={fieldName}
            className={this.getCheckboxLabelCSS()}
        >
            {this.state.meta.labels[fieldName]}
        </label>
    }

    /**
     * this function creates and returns a JSX of textarea element
     * override this function to customise it
     * @param {String} fieldName 
     * @returns {JSX}
     */
    getTextareaElement(fieldName) {
        return (
            <textarea
                key={'textarea-' + fieldName}
                id={fieldName}
                className={this.state.meta.css[fieldName] || this.getTextareaCSS() || this.getDefaultCSS()}
                name={fieldName} id={fieldName} key={fieldName}
                value={this.state.values[fieldName]}
                placeholder={this.state.meta.placeholders[fieldName]}
                onChange={this.onChange}
            />
        );
    }
    
    /**
     * this function creates and returns a JSX of Select element
     * override this function to cusotmize it
     * @param {String} fieldName 
     * @param {Boolean} isMultiple //true to make a multiselect 
     * @returns {JSX}
     */
    getSelectElement(fieldName, isMultiple = false) {
        return (
            <select
                key={'select-' + fieldName}
                multiple={isMultiple}
                name={fieldName}
                id={fieldName}
                value={this.state.values[fieldName]}
                className={this.state.meta.css[fieldName] || this.getSelectCSS() || this.getDefaultCSS()}
                onChange={this.onChange}
            >
                {this.state.meta.options[fieldName].map(option => (<option value={option.value} key={'option-'+option.name}>{option.name}</option>))}
            </select>
        );
    }
    /**
     * this function returns a string of css class names separated by space to be used
     * for select element
     * @returns {String}
     */
    getSelectCSS() {
        return 'form-control';
    }
    /**
     * this function returns a string of css class names separated by space to be used
     * for textarea element
     * @returns {String}
     */
    getTextareaCSS() {
        return 'form-control';
    }
    /**
     * this function is used to give class names to a group of form elements
     * override this function to give your own string of classes separated by space
     * @returns {String} every word separated by space in this string will be used as class
     */
    getGroupCSS() {
        return 'form-group';
    }
    /**
     * this function is used to give class names to each label element
     * override this function to give your own a string of classes separated by space
     * @returns {String} every word separated by space in this string will be used as class
     */
    getLabelCSS() {
        return '';
    }
    /**
     * this function is used to give class names to each input/select/textarea element
     * override this function to give your own a string of classes separated by space
     * @returns {String} every word separated by space in this string will be used as class
     */
    getDefaultCSS() {
        return 'form-control';
    }
    /**
     * this function returns a string of css classes separated by space to be used in
     * radio labels
     * override it to fit your need
     * @returns {String}
     */
    getRadioLabelCSS() {
        return 'form-check-label';
    }
    /**
     * this function returns a string of css classes separated by space to be used in
     * checkbox labels
     * override it to fit your need
     * @returns {String}
     */
    getCheckboxLabelCSS() {
        return 'form-check-label';
    }
    /**
     * this function returns a string of css class names separated by space to be used
     * in radio group element
     * @returns {String}
     */
    getRadioElementCSS() {
        return 'form-check';
    }
    /**
     * this function returns a string of css class names separated by space to be used
     * in checkbox group element
     * @returns {String}
     */
    getCheckboxElementCSS() {
        return 'form-check';
    }
    /**
     * this function returns a string of css classes separated by space to be used in
     * radio input element as class
     * override it to fit your need
     * @returns {String}
     */
    getRadioInputCSS() {
        return 'form-check-input';
    }
    /**
     * this function returns a string of css classes separated by space to be used in
     * checkbox input element as class
     * override it to fit your need
     * @returns {String}
     */
    getCheckboxInputCSS() {
        return 'form-check-input';
    }
}
