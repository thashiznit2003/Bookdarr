import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styles from './TextInput.css';

class TextInput extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._input = null;
    this._selectionStart = null;
    this._selectionEnd = null;
    this._selectionTimeout = null;
    this._isMouseTarget = false;
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.onDocumentMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onDocumentMouseUp);

    if (this._selectionTimeout) {
      this._selectionTimeout = clearTimeout(this._selectionTimeout);
    }
  }

  //
  // Control

  setInputRef = (ref) => {
    this._input = ref;
  };

  selectionChange() {
    if (this._selectionTimeout) {
      this._selectionTimeout = clearTimeout(this._selectionTimeout);
    }

    this._selectionTimeout = setTimeout(() => {
      const selectionStart = this._input.selectionStart;
      const selectionEnd = this._input.selectionEnd;

      const selectionChanged = (
        this._selectionStart !== selectionStart ||
        this._selectionEnd !== selectionEnd
      );

      this._selectionStart = selectionStart;
      this._selectionEnd = selectionEnd;

      if (this.props.onSelectionChange && selectionChanged) {
        this.props.onSelectionChange(selectionStart, selectionEnd);
      }
    }, 10);
  }

  //
  // Listeners

  onChange = (event) => {
    const {
      name,
      type,
      onChange
    } = this.props;

    const payload = {
      name,
      value: event.target.value
    };

    // Also return the files for a file input type.

    if (type === 'file') {
      payload.files = event.target.files;
    }

    onChange(payload);
  };

  onFocus = (event) => {
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }

    this.selectionChange();
  };

  onKeyUp = () => {
    this.selectionChange();
  };

  onMouseDown = () => {
    this._isMouseTarget = true;
  };

  onMouseUp = () => {
    this.selectionChange();
  };

  onDocumentMouseUp = () => {
    if (this._isMouseTarget) {
      this.selectionChange();
    }

    this._isMouseTarget = false;
  };

  onWheel = () => {
    if (this.props.type === 'number') {
      this._input.blur();
    }
  };

  //
  // Render

  render() {
    const {
      className,
      type,
      readOnly,
      autoFocus,
      placeholder,
      name,
      value,
      hasError,
      hasWarning,
      hasButton,
      step,
      min,
      max,
      autoComplete,
      dataFormType,
      dataLpignore,
      data1pIgnore,
      dataBwignore,
      onBlur,
      onCopy,
      onKeyDown,
      multiple,
      accept,
      ...rest
    } = this.props;

    const inputName = dataFormType === 'login' ? name : `bookdarr-${name}`;
    const inputValue = type === 'file' ? undefined : value;

    return (
      <input
        ref={this.setInputRef}
        type={type}
        readOnly={readOnly}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={classNames(
          className,
          readOnly && styles.readOnly,
          hasError && styles.hasError,
          hasWarning && styles.hasWarning,
          hasButton && styles.hasButton
        )}
        name={inputName}
        value={inputValue}
        autoComplete={autoComplete}
        data-form-type={dataFormType}
        data-lpignore={dataLpignore}
        data-1p-ignore={data1pIgnore}
        data-bwignore={dataBwignore}
        step={step}
        min={min}
        max={max}
        multiple={multiple}
        accept={accept}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={onBlur}
        onCopy={onCopy}
        onCut={onCopy}
        onKeyDown={onKeyDown}
        onKeyUp={this.onKeyUp}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onWheel={this.onWheel}
        {...rest}
      />
    );
  }
}

TextInput.propTypes = {
  className: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  placeholder: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]).isRequired,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  hasButton: PropTypes.bool,
  step: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  autoComplete: PropTypes.string,
  dataFormType: PropTypes.string,
  dataLpignore: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  data1pIgnore: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  dataBwignore: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  multiple: PropTypes.bool,
  accept: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onCopy: PropTypes.func,
  onSelectionChange: PropTypes.func
};

TextInput.defaultProps = {
  className: styles.input,
  type: 'text',
  readOnly: false,
  autoFocus: false,
  value: '',
  autoComplete: 'off',
  dataFormType: 'other',
  dataLpignore: true,
  data1pIgnore: true,
  dataBwignore: true
};

export default TextInput;
