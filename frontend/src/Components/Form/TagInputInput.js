import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { kinds } from 'Helpers/Props';
import tagShape from 'Helpers/Props/Shapes/tagShape';
import styles from './TagInputInput.css';

class TagInputInput extends Component {

  onMouseDown = (event) => {
    event.preventDefault();

    const {
      isFocused,
      onInputContainerPress
    } = this.props;

    if (isFocused) {
      return;
    }

    onInputContainerPress();
  };

  render() {
    const {
      forwardedRef,
      className,
      tags,
      inputProps,
      kind,
      canEdit,
      tagComponent: TagComponent,
      onTagDelete,
      onTagEdit
    } = this.props;
    const safeInputProps = { ...inputProps };

    safeInputProps.autoComplete = inputProps?.autoComplete ?? 'off';
    safeInputProps['data-form-type'] = inputProps?.['data-form-type'] ?? 'other';
    safeInputProps['data-lpignore'] = inputProps?.['data-lpignore'] ?? 'true';
    safeInputProps['data-1p-ignore'] = inputProps?.['data-1p-ignore'] ?? 'true';
    safeInputProps['data-bwignore'] = inputProps?.['data-bwignore'] ?? 'true';

    const inputName = safeInputProps?.name;
    if (inputName && safeInputProps['data-form-type'] !== 'login') {
      safeInputProps.name = `bookdarr-${inputName}`;
    }

    return (
      <div
        ref={forwardedRef}
        className={className}
        onMouseDown={this.onMouseDown}
      >
        {
          tags.map((tag, index) => {
            return (
              <TagComponent
                key={tag.id}
                index={index}
                tag={tag}
                kind={kind}
                canEdit={canEdit}
                isLastTag={index === tags.length - 1}
                onDelete={onTagDelete}
                onEdit={onTagEdit}
              />
            );
          })
        }

        <input {...safeInputProps} />
      </div>
    );
  }
}

TagInputInput.propTypes = {
  forwardedRef: PropTypes.func,
  className: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.shape(tagShape)).isRequired,
  inputProps: PropTypes.object.isRequired,
  kind: PropTypes.oneOf(kinds.all).isRequired,
  isFocused: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  tagComponent: PropTypes.elementType.isRequired,
  onTagDelete: PropTypes.func.isRequired,
  onTagEdit: PropTypes.func.isRequired,
  onInputContainerPress: PropTypes.func.isRequired
};

TagInputInput.defaultProps = {
  className: styles.inputContainer
};

export default TagInputInput;
