/*
**  This component will be published in a separate package
*/
import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

const defaultStyles = {
  avatarStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textStyle: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'transparent',
    fontWeight: '100',
  },
};

// TODO
// 3 words name initials
// handle only alpha numeric chars

export default class GiftedAvatar extends React.Component {
  setAvatarColor() {
    const { user } = this.props;

    const userName = user.name || '';
    const name = userName.toUpperCase().split(' ');
    if (name.length === 1) {
      this.avatarName = `${name[0].charAt(0)}`;
    } else if (name.length > 1) {
      this.avatarName = `${name[0].charAt(0)}${name[1].charAt(0)}`;
    } else {
      this.avatarName = '';
    }

    let sumChars = 0;
    for (let i = 0; i < userName.length; i += 1) {
      sumChars += userName.charCodeAt(i);
    }

    // inspired by https://github.com/wbinnssmith/react-user-avatar
    // colors from https://flatuicolors.com/
    const colors = [
      '#e67e22', // carrot
      '#2ecc71', // emerald
      '#3498db', // peter river
      '#8e44ad', // wisteria
      '#e74c3c', // alizarin
      '#1abc9c', // turquoise
      '#2c3e50', // midnight blue
    ];

    this.avatarColor = colors[sumChars % colors.length];
  }

  renderAvatar() {
    const { user, avatarStyle } = this.props;

    if (typeof user.avatar === 'function') {
      return user.avatar();
    } else if (typeof user.avatar === 'string') {
      return (
        <Image
          source={{ uri: user.avatar }}
          style={[defaultStyles.avatarStyle, avatarStyle]}
        />
      );
    } else if (typeof user.avatar === 'number') {
      return (
        <Image
          source={user.avatar}
          style={[defaultStyles.avatarStyle, avatarStyle]}
        />
      );
    }
    return null;
  }

  renderInitials() {
    const { textStyle } = this.props;

    return (
      <Text style={[defaultStyles.textStyle, textStyle]}>
        {this.avatarName}
      </Text>
    );
  }

  render() {
    const { onPress, ...other } = this.props;
    const { user, avatarStyle } = other;

    if (!user.name && !user.avatar) {
      // render placeholder
      return (
        <View
          style={[
            defaultStyles.avatarStyle,
            { backgroundColor: 'transparent' },
            avatarStyle,
          ]}
          accessibilityTraits="image"
        />
      );
    }
    if (user.avatar) {
      return (
        <TouchableOpacity
          disabled={onPress !== undefined}
          onPress={() => onPress && onPress(other)}
          accessibilityTraits="image"
        >
          {this.renderAvatar()}
        </TouchableOpacity>
      );
    }

    if (!this.avatarColor) {
      this.setAvatarColor();
    }

    return (
      <TouchableOpacity
        disabled={onPress !== undefined}
        onPress={() => onPress && onPress(other)}
        style={[
          defaultStyles.avatarStyle,
          { backgroundColor: this.avatarColor },
          avatarStyle,
        ]}
        accessibilityTraits="image"
      >
        {this.renderInitials()}
      </TouchableOpacity>
    );
  }
}

GiftedAvatar.defaultProps = {
  user: {
    name: null,
    avatar: null,
  },
  onPress: undefined,
  avatarStyle: {},
  textStyle: {},
};

GiftedAvatar.propTypes = {
  user: PropTypes.object,
  onPress: PropTypes.func,
  avatarStyle: Image.propTypes.style,
  textStyle: Text.propTypes.style,
};
