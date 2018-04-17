import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
} from 'react-native';

import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    height: 44,
    justifyContent: 'flex-end',
  },
  text: {
    color: '#0084ff',
    fontWeight: '600',
    fontSize: 17,
    backgroundColor: 'transparent',
    marginBottom: 12,
    marginLeft: 10,
    marginRight: 10,
  },
});

export default class Send extends React.Component {
  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.props.text.trim().length === 0 && nextProps.text.trim().length > 0
  // || this.props.text.trim().length > 0 && nextProps.text.trim().length === 0) {
  //     return true;
  //   }
  //   return false;
  // }
  render() {
    const { text, textSendButtonStyle, label, containerStyle, onSend } = this.props;

    if (this.props.text.trim().length > 0) {
      return (
        <TouchableOpacity
          style={[styles.container, containerStyle]}
          onPress={() => {
            onSend({ text: text.trim() }, true);
          }}
          onClick={() => {
            onSend({ text: text.trim() }, true);
          }}
          accessibilityTraits="button"
        >
          <Text style={[styles.text, textSendButtonStyle]}>{label}</Text>
        </TouchableOpacity>
      );
    }
    return <View />;
  }
}


Send.defaultProps = {
  text: '',
  onSend: () => {},
  label: 'Send',
  containerStyle: {},
  textSendButtonStyle: {},
};

Send.propTypes = {
  text: PropTypes.string,
  onSend: PropTypes.func,
  label: PropTypes.string,
  containerStyle: ViewPropTypes.style,
  textSendButtonStyle: Text.propTypes.style,
};
