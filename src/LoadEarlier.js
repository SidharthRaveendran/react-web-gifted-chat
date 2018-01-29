import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b2b2b2',
    borderRadius: 15,
    height: 30,
    paddingLeft: 10,
    paddingRight: 10,
  },
  text: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 12,
  },
  activityIndicator: {
    marginTop: Platform.select({
      ios: -14,
      android: -16,
    }),
  },
});

export default class LoadEarlier extends React.Component {
  renderLoading() {
    const { isLoadingEarlier, textStyle, label } = this.props;

    if (isLoadingEarlier === false) {
      return (
        <Text style={[styles.text, textStyle]}>
          {label}
        </Text>
      );
    }
    return (
      <View>
        <Text style={[styles.text, textStyle, { opacity: 0 }]}>
          {label}
        </Text>
        <ActivityIndicator
          color="white"
          size="small"
          style={[styles.activityIndicator, this.props.activityIndicatorStyle]}
        />
      </View>
    );
  }

  render() {
    const { containerStyle, wrapperStyle, onLoadEarlier, isLoadingEarlier } = this.props;

    return (
      <TouchableOpacity
        style={[styles.container, containerStyle]}
        onPress={() => {
          if (onLoadEarlier) {
            onLoadEarlier();
          }
        }}
        disabled={isLoadingEarlier === true}
        accessibilityTraits="button"
      >
        <View style={[styles.wrapper, wrapperStyle]}>
          {this.renderLoading()}
        </View>
      </TouchableOpacity>
    );
  }
}

LoadEarlier.defaultProps = {
  onLoadEarlier: () => {},
  isLoadingEarlier: false,
  label: 'Load earlier messages',
  containerStyle: {},
  wrapperStyle: {},
  textStyle: {},
  activityIndicatorStyle: {},
};

LoadEarlier.propTypes = {
  onLoadEarlier: PropTypes.func,
  isLoadingEarlier: PropTypes.bool,
  label: PropTypes.string,
  containerStyle: ViewPropTypes.style,
  wrapperStyle: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  activityIndicatorStyle: ViewPropTypes.style,
};
