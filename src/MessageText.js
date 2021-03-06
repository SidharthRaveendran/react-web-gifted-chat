import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  View,
  ViewPropTypes,
} from 'react-native';

import PropTypes from 'prop-types';
import ParsedText from 'react-native-parsed-text';

const styles = {
  left: StyleSheet.create({
    container: {
    },
    text: {
      color: 'black',
      fontSize: 16,
      lineHeight: 20,
      marginTop: 5,
      marginBottom: 5,
      marginLeft: 10,
      marginRight: 10,
    },
    link: {
      color: 'black',
      textDecorationLine: 'underline',
    },
  }),
  right: StyleSheet.create({
    container: {
    },
    text: {
      color: 'white',
      fontSize: 16,
      lineHeight: 20,
      marginTop: 5,
      marginBottom: 5,
      marginLeft: 10,
      marginRight: 10,
    },
    link: {
      color: 'white',
      textDecorationLine: 'underline',
    },
  }),
};

export default class MessageText extends React.Component {
  constructor(props) {
    super(props);

    this.onUrlPress = this.onUrlPress.bind(this);
    this.onPhonePress = this.onPhonePress.bind(this);
    this.onEmailPress = this.onEmailPress.bind(this);
  }

  onUrlPress(url) {
    Linking.openURL(url);
  }

  // onPhonePress(phone) {
  //   const options = [
  //     'Text',
  //     'Call',
  //     'Cancel',
  //   ];
  //   const cancelButtonIndex = options.length - 1;
  //   this.context.actionSheet().showActionSheetWithOptions({
  //     options,
  //     cancelButtonIndex,
  //   },
  //   (buttonIndex) => {
  //     // switch (buttonIndex) {
  //     //   case 0:
  //     //     Communications.phonecall(phone, true);
  //     //     break;
  //     //   case 1:
  //     //     Communications.text(phone);
  //     //     break;
  //     // }
  //   });
  // }
  onPhonePress(phone) {
    return phone;
  }

  onEmailPress(email) {
  //   //Communications.email(email, null, null, null, null);
    return email;
  }

  render() {
    const { position, linkStyle, currentMessage, containerStyle, textStyle } = this.props;

    return (
      <View style={[styles[position].container, containerStyle[position]]}>
        <ParsedText
          style={[styles[position].text, textStyle[position]]}
          parse={[
            {
              type: 'url',
              style: StyleSheet.flatten([styles[position].link, linkStyle[position]]),
              onPress: this.onUrlPress,
            },
            {
              type: 'phone',
              style: StyleSheet.flatten([styles[position].link, linkStyle[position]]),
              onPress: this.onPhonePress,
            },
            {
              type: 'email',
              style: StyleSheet.flatten([styles[position].link, linkStyle[position]]),
              onPress: this.onEmailPress,
            },
          ]}
        >
          {currentMessage.text}
        </ParsedText>
      </View>
    );
  }
}


MessageText.contextTypes = {
  actionSheet: PropTypes.func,
};

MessageText.defaultProps = {
  position: 'left',
  currentMessage: {
    text: '',
  },
  containerStyle: {},
  textStyle: {},
  linkStyle: {},
};

MessageText.propTypes = {
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
  linkStyle: PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
};
