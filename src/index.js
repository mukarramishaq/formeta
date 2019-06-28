import React from 'react';

export default class extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = Object.assign({}, this.props);
        this.initializeMetaInState()// assign or initialize metadata
        this.state.values = this.state.meta.attributes || {}; //default values of form elements
        this.state.inputTypes = ['text', 'number', 'password']; // A list of types of input whose elements will be created through this.getInputElement functio
        this.onChange = this.onChange.bind(this); // bind onChange function to this context
        this.onSubmit = this.onSubmit.bind(this); // bind onSubmit function to this context
    }

    /**
     * this function initializes the meta in state
     */
    initializeMetaInState(){
        this.state.meta = this.state.meta || {};
        this.state.meta.fields = this.state.meta.fields != undefined ? Array.isArray(this.state.meta.fields) === true ? this.state.meta.fields : [this.state.meta.fields] : [];
        this.state.meta.labels = Object.assign({}, this.state.meta.labels);
        this.state.meta.types = Object.assign({}, this.state.meta.types);
        this.state.meta.placeholders = Object.assign({}, this.state.meta.placeholders);
        this.state.meta.css = Object.assign({}, this.state.meta.css);
        this.state.meta.options = this.state.meta.options != undefined ? Array.isArray(this.state.meta.options) === true ? this.state.meta.options : [this.state.meta.options] : [];
        this.state.values = Object.assign({}, this.state.attributes);
        this.state.meta.layout = Object.assign({}, this.state.meta.layout);
    }
    
    render() {
        return this.renderForm();
    }
    
    /**
     * this function creates forms and its internal all elements
     * and returns the JSX
     * @returns {JSX}
     */
    renderForm() {
        this.initializeEmptyMetaAttributes();
        this.processLayout();
        return this.getFormElementWrapper(this.getFormElement(
            <div key={`form-body-${(new Date()).getTime()}`}>
                {this.state.meta.layout.rows.map((row, rowIndex) => {
                    return <div key={`layout-div-row-${rowIndex}`} className={this.getRowCSS()}>
                        {row.map((field, fieldIndex) => {
                            this.setEmptyMetaOfField(field);
                            return <div key={`layout-div-col-${fieldIndex}-row-${rowIndex}`} className={this.getColumnSpanCSS(field)}>{this.getElement(field)}</div>;    
                        })}
                    </div>
                })}
                {this.getSubmitButtonElementWrapper(this.getSubmitButtonElement())}
            </div>
        ));
    }

    processLayout(){
        //if layout object is missing from state
        this.state.meta.layout = Object.assign({}, this.state.meta.layout);
        this.state.meta.layout.rows = this.state.meta.layout.rows != undefined ? Array.isArray(this.state.meta.layout.rows) === true ? this.state.meta.layout.rows : [] : [];
        //if rows array is empty then populate it with fields from meta
        if (this.state.meta.layout.rows.length <= 0) {
            let row = [];
            this.state.meta.fields.map(field => {
                row.push(field);
                if (row.length >= this.getDefaultNumberOfElementsPerRow()) {
                    this.state.meta.layout.rows.push(row);
                    row = [];
                }
            });
        }
        this.state.meta.layout.rows.map(row => {
            row.map(field => {
                this.state.meta.layout[field] = this.state.meta.layout[field] || {};
                this.state.meta.layout[field].span = this.state.meta.layout[field].span || Math.round(this.getTotalNumberOfColumnsPerRow()/row.length);
            });
        });
    }
    getTotalNumberOfColumnsPerRow(){
        return 12;
    }
    getDefaultNumberOfElementsPerRow(){
        return 1;
    }
    getRowCSS(){
        return 'row';
    }
    getDefaultColumnSpan(){
        return 2;
    }
    getColumnSpanCSS(field){
        let span = +this.state.meta.layout[field].span;
        span = isNaN(span) === true ? this.getDefaultColumnSpan() : span;
        return this[`getColumnSpan${span}CSS`]();
    }
    getColumnSpan0CSS(){
        return this.getColumnSpan12CSS();
    }
    getColumnSpan1CSS(){
        return 'col-md-1'
    }
    getColumnSpan2CSS(){
        return 'col-md-2'
    }
    getColumnSpan3CSS(){
        return 'col-md-3'
    }
    getColumnSpan4CSS(){
        return 'col-md-4'
    }
    getColumnSpan5CSS(){
        return 'col-md-5'
    }
    getColumnSpan6CSS(){
        return 'col-md-6'
    }
    getColumnSpan7CSS(){
        return 'col-md-7'
    }
    getColumnSpan8CSS(){
        return 'col-md-8'
    }
    getColumnSpan9CSS(){
        return 'col-md-9'
    }
    getColumnSpan10CSS(){
        return 'col-md-10'
    }
    getColumnSpan11CSS(){
        return 'col-md-11'
    }
    getColumnSpan12CSS(){
        return 'col-md-12'
    }
    

    /**
     * this function get form data and wraps it with JSX form element and returns it
     * you can override it if you want to change something in element
     * @param {JSX | Array} formData is either a JSX element or an array of JSX elements
     * all the form head, body and footer data will be in this variable which will then be 
     * wrapped around by form element 
     */
    getFormElement(formData){
        return <form onSubmit={this.onSubmit} className={this.getFormElementCSS()}>
            {formData}
        </form>
    }

    /**
     * this function falls back to some default behavior to fill up the empty
     * data of meta about a field
     * The types of meta which are handled are 'types', 'labels', 'placeholders'
     * If it can't find values of above attributes in meta about this field, it tries to guess it
     * through some methods which are
     * 1- function parseLabelFromFieldName for labels
     * 2- function parsePlaceholderFromFieldName for placeholder
     * 3- function getDefaultType for type
     * @param {String} fieldName 
     */
    setEmptyMetaOfField(fieldName){
        //if field type is missing
        this.state.meta.types[fieldName] == undefined ? this.state.meta.types[fieldName] = this.getDefaultType() : undefined;
        //if field label is missing
        this.state.meta.labels[fieldName] == undefined ? this.state.meta.labels[fieldName] = this.parseLabelFromFieldName(fieldName) : undefined;
        //if field placeholder is missing
        this.state.meta.placeholders[fieldName] == undefined ? this.state.meta.placeholders[fieldName] = this.parsePlaceholderFromFieldName(fieldName) : undefined;
    }

    /**
     * this function parses Label from field name
     * by default it just returns that field name but you can override it
     * to fit your need
     * @param {String} fieldName 
     */
    parseLabelFromFieldName(fieldName){
        return fieldName;
    }

    /**
     * this function parses placeholder value from field name
     * you can overrride it to fit your need
     * @param {String} fieldName 
     */
    parsePlaceholderFromFieldName(fieldName){
        return `Write ${fieldName} here ...`;
    }

    initializeEmptyMetaAttributes(){
        //if fields array is missing
        this.state.meta.fields = this.state.meta.fields != undefined ? Array.isArray(this.state.meta.fields) === true ? this.state.meta.fields : [this.state.meta.fields] : [];
        //if types object is missing
        this.state.meta.types = Object.assign({}, this.state.meta.types);
        //if labels object is missing
        this.state.meta.labels = Object.assign({}, this.state.meta.labels);
        //if placeholders object is missing
        this.state.meta.placeholders = Object.assign({}, this.state.meta.placeholders);
        //if options object is missing
        this.state.meta.options = Object.assign({}, this.state.meta.options);
        //if css object is missing
        this.state.meta.css = Object.assign({}, this.state.meta.css);
        //if attributes objects is missing
        this.state.meta.attributes = Object.assign({}, this.state.meta.attributes);
    }

    /**
     * getFormElementWrapper wraps the form element in some other JSX and returns it
     * By default it does nothing except return the same incoming form element
     * If you want to have your own wrapper that always wraps every form element then
     * override this function
     * 
     * @param {JSX} formElement
     * @returns {JSX} 
     */
    getFormElementWrapper(formElement) {
        return (formElement);
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
                for (let option of target.selectedOptions) {
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
            <button type="submit" className={this.getSubmitButtonCSS()} key="submit-button">{this.getSubmitButtonName()}</button>
        );
    }

    /**
     * getSubmitButtonElementWrapper wraps the submit button element in some other JSX and returns it
     * By default it does nothing except return the same incoming button element
     * If you want to have your own wrapper that always wraps every submit button element of a form then
     * override this function
     * 
     * @param {JSX} submitButtonElement
     * @returns {JSX} 
     */
    getSubmitButtonElementWrapper(submitButtonElement) {
        return (submitButtonElement);
    }

    /**
     * override this function give name/value of your own
     * choice
     * @returns {String}
     */
    getSubmitButtonName() {
        return 'Save';
    }
    
    /**
     * this function returns a group of label and input/select/textarea elements
     * @param {String} //field name
     * @returns {JSX}
     */
    getElement(fieldName) {
        let element;
        if (this.state.inputTypes.includes(this.state.meta.types[fieldName].toLowerCase())) {
            element = this.getInputElementWrapper(this.getInputElement(fieldName));
        } else if (this.state.meta.types[fieldName].toLowerCase() === 'textarea') {
            element = this.getTextareaElementWrapper(this.getTextareaElement(fieldName));
        } else if (this.state.meta.types[fieldName].toLowerCase() === 'select') {
            let isMultiSelect = Array.isArray(this.state.meta.multiSelect) && this.state.meta.multiSelect.includes(fieldName);
            element = this.getSelectElementWrapper(this.getSelectElement(fieldName, isMultiSelect));
        } else if (this.state.meta.types[fieldName].toLowerCase() === 'radio') {
            element = this.getRadioElementsWrapper(this.getRadioElements(fieldName));
        } else if (this.state.meta.types[fieldName].toLowerCase() === 'checkbox') {
            return this.getCheckboxElementWrapper(this.getCheckboxElement(fieldName));
        }
        let labelElement = this.getLabelElementWrapper(this.getLabelElement(fieldName));
        return this.getGroupLabelAndElementWrapper(this.groupLabelAndElement(labelElement, element, fieldName));
    }

    /**
     * this function returns default type of input element if none provided
     * @param {String} fieldName 
     * @returns {String}
     */
    getDefaultType(fieldName){
       return 'text'; 
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
     * getGroupLabelAndElementWrapper wraps the group of label and input element in some other JSX and returns it
     * By default it does nothing except return the same incoming group element
     * If you want to have your own wrapper that always wraps every group element then
     * override this function
     * 
     * @param {JSX} groupElement
     * @returns {JSX} 
     */
    getGroupLabelAndElementWrapper(groupElement) {
        return (groupElement);
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
     * getLabelElementWrapper wraps the label element in some other JSX and returns it
     * By default it does nothing except return the same incoming label element
     * If you want to have your own wrapper that always wraps every label element then
     * override this function
     * 
     * @param {JSX} labelElement
     * @returns {JSX} 
     */
    getLabelElementWrapper(labelElement) {
        return (labelElement);
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
     * getInputElementWrapper wraps the input element in some other JSX and returns it
     * By default it does nothing except return the same incoming input element
     * If you want to have your own wrapper that always wraps every input element then
     * override this function
     * 
     * @param {JSX} inputElement
     * @returns {JSX} 
     */
    getInputElementWrapper(inputElement) {
        return (inputElement);
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
     * getRadioElementsWrapper wraps the radio input elements passed as parameter in some other JSX and returns it
     * By default it does nothing except return the same incoming radio input elements array
     * If you want to have your own wrapper that always wraps radio input elements group then
     * override this function
     * 
     * @param {Array} radioElements an array of JSX radio elements
     * @returns {JSX | Array} 
     */
    getRadioElementsWrapper(radioElements) {
        return (radioElements);
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
            {this.getRadioInputElementWrapper(this.getRadioInputElement(fieldName, radio))}
            {this.getRadioLabelElementWrapper(this.getRadioLabelElement(radio))}
        </div>
    }

    /**
     * getRadioElementWrapper wraps the radio input element in some other JSX and returns it
     * By default it does nothing except return the same incoming radio input element
     * If you want to have your own wrapper that always wraps every radio input element then
     * override this function
     * 
     * @param {JSX} radioElement
     * @returns {JSX} 
     */
    getRadioElementWrapper(radioElement) {
        return (radioElement);
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
            {this.getCheckboxElementWrapper(this.getCheckboxInputElement(fieldName))}
            {this.getCheckboxLabelElementWrapper(this.getCheckboxLabelElement(fieldName))}
        </div>
    }

    /**
     * getCheckboxElementWrapper wraps the checkbox input element in some other JSX and returns it
     * By default it does nothing except return the same incoming checkbox input element
     * If you want to have your own wrapper that always wraps every checkbox input element then
     * override this function
     * 
     * @param {JSX} checkboxElement 
     * @returns {JSX}
     */
    getCheckboxElementWrapper(checkboxElement) {
        return (checkboxElement);
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
     * getRadioInputElementWrapper wraps the radio input element in some other JSX and returns it
     * By default it does nothing except return the same incoming radio input element
     * If you want to have your own wrapper that always wraps every radio input element then
     * override this function
     * 
     * @param {JSX} radioInputElement
     * @returns {JSX} 
     */
    getRadioInputElementWrapper(radioInputElement) {
        return (radioInputElement);
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
     * getCheckboxInputElementWrapper wraps the checkbox input element in some other JSX and returns it
     * By default it does nothing except return the same incoming checkbox input element
     * If you want to have your own wrapper that always wraps every checkbox input element then
     * override this function
     * 
     * @param {JSX} checkboxInputElement
     * @returns {JSX} 
     */
    getCheckboxInputElementWrapper(checkboxInputElement) {
        return (checkboxInputElement);
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
     * getRadioLabelElementWrapper wraps the radio label element in some other JSX and returns it
     * By default it does nothing except return the same incoming radio label element
     * If you want to have your own wrapper that always wraps every radio label element then
     * override this function
     * 
     * @param {JSX} radioLabelElement
     * @returns {JSX} 
     */
    getRadioLabelElementWrapper(radioLabelElement) {
        return (radioLabelElement);
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
     * getCheckboxLabelElementWrapper wraps the checkbox label element in some other JSX and returns it
     * By default it does nothing except return the same incoming checkbox label element
     * If you want to have your own wrapper that always wraps every checkbox label element then
     * override this function
     * 
     * @param {JSX} checkboxLabelElement
     * @returns {JSX} 
     */
    getCheckboxLabelElementWrapper(checkboxLabelElement) {
        return (checkboxLabelElement);
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
                className={this.state.meta.css[fieldName] || this.getTextareaCSS()}
                name={fieldName} id={fieldName} key={fieldName}
                value={this.state.values[fieldName]}
                placeholder={this.state.meta.placeholders[fieldName]}
                onChange={this.onChange}
            />
        );
    }
    
    /**
     * getTextareaElementWrapper wraps the textarea element in some other JSX and returns it
     * By default it does nothing except returns the same incoming element
     * If you want have your own wrapper that always wraps every textarea element then
     * override this function according to your need
     * @param {JSX} textareaElement
     * @returns {JSX} 
     */
    getTextareaElementWrapper(textareaElement) {
        return (textareaElement);
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
                className={this.state.meta.css[fieldName] || this.getSelectCSS()}
                onChange={this.onChange}
            >
                {this.state.meta.options[fieldName] && this.state.meta.options[fieldName].map(option => (<option value={option.value} key={'option-' + option.name}>{option.name}</option>))}
            </select>
        );
    }
    
    /**
     * getSelectElementWrapper wraps the select element in some other JSX and returns it
     * By default it does nothing except return the same incoming select element
     * If you want have your own wrapper that always wraps every select element then
     * override this function
     * @param {JSX} selectElement
     * @returns {JSX} 
     */
    getSelectElementWrapper(selectElement) {
        return (selectElement);
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
    
    /**
     * this function returns a string of css classes separated by space to be used in
     * submit button element as class
     * override it to fit your need
     * @returns {String}
     */
    getSubmitButtonCSS() {
        return 'btn btn-success';
    }

    /**
     * this function returns a string of css classes separated by space to be used in
     * form element as class
     * override it to fit your need
     * @returns {String}
     */
    getFormElementCSS() {
        return 'form'
    }
}
