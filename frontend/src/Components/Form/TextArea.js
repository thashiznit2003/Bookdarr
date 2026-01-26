import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styles from './TextArea.css';

class TextArea extends Component {

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
      onChange
    } = this.props;

    const payload = {
      name,
      value: event.target.value
    };

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

  //
  // Render

  render() {
    const {
      className,
      readOnly,
      autoFocus,
      placeholder,
      name,
      value,
      hasError,
      hasWarning,
      autoComplete,
      dataFormType,
      dataLpignore,
      data1pIgnore,
      dataBwignore,
      onBlur
    } = this.props;

    const inputName = dataFormType === 'login' ? name : `bookdarr-${name}`;

    return (
      <textarea
        ref={this.setInputRef}
        readOnly={readOnly}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={classNames(
          className,
          readOnly && styles.readOnly,
          hasError && styles.hasError,
          hasWarning && styles.hasWarning
        )}
        name={inputName}
        value={value}
        autoComplete={autoComplete}
        data-form-type={dataFormType}
        data-lpignore={dataLpignore}
        data-1p-ignore={data1pIgnore}
        data-bwignore={dataBwignore}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={onBlur}
        onKeyUp={this.onKeyUp}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
      />
    );
  }
}

TextArea.propTypes = {
  className: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  placeholder: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]).isRequired,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  autoComplete: PropTypes.string,
  dataFormType: PropTypes.string,
  dataLpignore: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  data1pIgnore: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  dataBwignore: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onSelectionChange: PropTypes.func
};

TextArea.defaultProps = {
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

export default TextArea;
