import React from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    lineHeight: 16,
    marginTop: Platform.select({
      ios: 6,
      android: 0,
    }),
    marginBottom: Platform.select({
      ios: 5,
      android: 3,
    }),
  },
});

export default class Composer extends React.Component {
  onChange(e) {
    const { contentSize } = e.nativeEvent;
    const { onInputSizeChanged } = this.props;

    if (!this.contentSize) {
      this.contentSize = contentSize;
      onInputSizeChanged(this.contentSize);
    } else if (this.contentSize.width !== contentSize.width || this.contentSize.height !== contentSize.height) {
      this.contentSize = contentSize;
      onInputSizeChanged(this.contentSize);
    }
  }

  render() {
    const {
      onTextChanged,
      placeholder,
      placeholderTextColor,
      multiline,
      textInputStyle,
      composerHeight,
      text,
      textInputProps,
    } = this.props;

    return (
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        multiline={multiline}

        onContentSizeChange={(e) => this.onChange(e)}
        onChangeText={(value) => onTextChanged(value)}

        style={[styles.textInput, textInputStyle, { height: composerHeight }]}

        value={text}
        accessibilityLabel={text || placeholder}
        enablesReturnKeyAutomatically
        underlineColorAndroid="transparent"
        {...textInputProps}
      />
    );
  }
}

Composer.defaultProps = {
  onChange: () => {
  },
  composerHeight: Platform.select({
    ios: 33,
    android: 41,
  }), // TODO SHARE with GiftedChat.js and tests
  text: '',
  placeholder: 'Type a message...',
  placeholderTextColor: '#b2b2b2',
  textInputProps: null,
  multiline: true,
  textInputStyle: {},
  onTextChanged: () => {
  },
  onInputSizeChanged: () => {
  },
};

Composer.propTypes = {
  // onChange: PropTypes.func,
  composerHeight: PropTypes.number,
  text: PropTypes.string,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  textInputProps: PropTypes.object,
  onTextChanged: PropTypes.func,
  onInputSizeChanged: PropTypes.func,
  multiline: PropTypes.bool,
  textInputStyle: TextInput.propTypes.style,
};
