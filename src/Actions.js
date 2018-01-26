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
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

export default class Actions extends React.Component {
  constructor(props) {
    super(props);
    this.onActionsPress = this.onActionsPress.bind(this);
  }

  onActionsPress() {
    const { options, optionTintColor } = this.props;

    const optionKeys = Object.keys(options);
    const cancelButtonIndex = Object.keys(options).length - 1;
    this.context.actionSheet().showActionSheetWithOptions({
      optionKeys,
      cancelButtonIndex,
      tintColor: optionTintColor,
    },
    (buttonIndex) => {
      let i = 0;
      for (let key in options) {
        if (options.hasOwnProperty(key)) {
          if (buttonIndex === i) {
            options[key](this.props);
            return;
          }
          i += 1;
        }
      }
    });
  }

  renderIcon() {
    const { icon, wrapperStyle, iconTextStyle } = this.props;

    if (icon) {
      return this.props.icon();
    }
    return (
      <View
        style={[styles.wrapper, wrapperStyle]}
      >
        <Text
          style={[styles.iconText, iconTextStyle]}
        >
          +
        </Text>
      </View>
    );
  }

  render() {
    const { containerStyle, onPressActionButton } = this.props;

    return (
      <TouchableOpacity
        style={[styles.container, containerStyle]}
        onPress={onPressActionButton || this.onActionsPress}
      >
        {this.renderIcon()}
      </TouchableOpacity>
    );
  }
}


Actions.contextTypes = {
  actionSheet: PropTypes.func,
};

Actions.defaultProps = {
  onSend: () => {},
  options: {},
  optionTintColor: '#007AFF',
  icon: null,
  containerStyle: {},
  iconTextStyle: {},
  wrapperStyle: {},
};

Actions.propTypes = {
  // onSend: PropTypes.func,
  options: PropTypes.object,
  optionTintColor: PropTypes.string,
  icon: PropTypes.func,
  onPressActionButton: PropTypes.func.isRequired,
  containerStyle: ViewPropTypes.style,
  iconTextStyle: Text.propTypes.style,
  wrapperStyle: Text.propTypes.style,
};
