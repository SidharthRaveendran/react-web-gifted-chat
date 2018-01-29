import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';

import moment from 'moment';

const containerStyleSelf = {
  marginLeft: 10,
  marginRight: 10,
  marginBottom: 5,
};

const textStyleSelf = {
  fontSize: 10,
  backgroundColor: 'transparent',
  textAlign: 'right',
};

const styles = {
  left: StyleSheet.create({
    container: {
      ...containerStyleSelf,
    },
    text: {
      color: '#aaa',
      ...textStyleSelf,
    },
  }),
  right: StyleSheet.create({
    container: {
      ...containerStyleSelf,
    },
    text: {
      color: '#fff',
      ...textStyleSelf,
    },
  }),
};

export default class Time extends React.Component {
  render() {
    const { position, currentMessage, containerStyle, textStyle } = this.pops;
    const locale = window.navigator.userLanguage || window.navigator.language;

    return (
      <View style={[styles[position].container, containerStyle[position]]}>
        <Text style={[styles[position].text, textStyle[position]]}>
          {moment(currentMessage.createdAt).locale(locale).format('LT')}
        </Text>
      </View>
    );
  }
}

Time.contextTypes = {
  getLocale: PropTypes.func,
};

Time.defaultProps = {
  position: 'left',
  currentMessage: {
    createdAt: null,
  },
  containerStyle: {},
  textStyle: {},
};

Time.propTypes = {
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  textStyle: PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
};
