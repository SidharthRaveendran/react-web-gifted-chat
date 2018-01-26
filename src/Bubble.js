import React from 'react';
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';

import MessageText from './MessageText';
import MessageImage from './MessageImage';
import Time from './Time';

import { isSameUser, isSameDay, warnDeprecated } from './utils';

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#f0f0f0',
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#0084ff',
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
  }),
  bottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tick: {
    fontSize: 10,
    backgroundColor: 'transparent',
    color: 'white',
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10,
  },
};

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);
    this.onLongPress = this.onLongPress.bind(this);
  }

  onLongPress() {
    const { onLongPress, currentMessage } = this.props;

    if (onLongPress) {
      onLongPress(this.context, currentMessage);
    } else if (currentMessage.text) {
      const options = [
        'Copy Text',
        'Cancel',
      ];
      const cancelButtonIndex = options.length - 1;

      this.context.actionSheet().showActionSheetWithOptions({
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            Clipboard.setString(currentMessage.text);
            break;
          default:
            break;
        }
      });
    }
  }

  handleBubbleToNext() {
    const {
      currentMessage,
      nextMessage,
      position,
      containerToNextStyle,
    } = this.props;

    if (isSameUser(currentMessage, nextMessage) && isSameDay(currentMessage, nextMessage)) {
      return StyleSheet.flatten([styles[position].containerToNext, containerToNextStyle[position]]);
    }
    return null;
  }

  handleBubbleToPrevious() {
    const {
      currentMessage,
      previousMessage,
      position,
      containerToPreviousStyle,
    } = this.props;

    if (isSameUser(currentMessage, previousMessage) && isSameDay(currentMessage, previousMessage)) {
      return StyleSheet.flatten([styles[position].containerToPrevious, containerToPreviousStyle[position]]);
    }
    return null;
  }

  renderMessageText() {
    const { containerStyle, wrapperStyle, ...messageTextProps } = this.props;
    const { currentMessage, renderMessageText } = messageTextProps;

    if (currentMessage.text) {
      if (renderMessageText) {
        return renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps} />;
    }
    return null;
  }

  renderMessageImage() {
    const { containerStyle, wrapperStyle, ...messageImageProps } = this.props;
    const { currentMessage, renderMessageImage } = messageImageProps;

    if (currentMessage.image) {
      if (renderMessageImage) {
        return renderMessageImage(messageImageProps);
      }
      return <MessageImage {...messageImageProps} />;
    }
    return null;
  }

  renderTicks() {
    const { currentMessage, renderTicks, user, tickStyle } = this.props;

    if (renderTicks) {
      return renderTicks(currentMessage);
    }
    if (currentMessage.user._id !== user._id) {
      return null;
    }
    if (currentMessage.sent || currentMessage.received) {
      return (
        <View style={styles.tickView}>
          {currentMessage.sent && <Text style={[styles.tick, tickStyle]}>✓</Text>}
          {currentMessage.received && <Text style={[styles.tick, tickStyle]}>✓</Text>}
        </View>
      );
    }

    return null;
  }

  renderTime() {
    const { containerStyle, wrapperStyle, ...timeProps } = this.props;
    const { currentMessage, renderTime } = timeProps;

    if (currentMessage.createdAt) {
      if (renderTime) {
        return renderTime(timeProps);
      }
      return <Time {...timeProps} />;
    }

    return null;
  }

  renderCustomView() {
    const { renderCustomView } = this.props;

    if (renderCustomView) {
      return renderCustomView(this.props);
    }
    return null;
  }


  render() {
    const {
      position,
      containerStyle,
      wrapperStyle,
      touchableProps,
      bottomContainerStyle,
    } = this.props;

    return (
      <View style={[styles[position].container, containerStyle[position]]}>
        <View style={
        [styles[position].wrapper, wrapperStyle[position],
          this.handleBubbleToNext(), this.handleBubbleToPrevious()]}
        >
          <TouchableWithoutFeedback
            onLongPress={this.onLongPress}
            accessibilityTraits="text"
            {...touchableProps}
          >
            <View>
              {this.renderCustomView()}
              {this.renderMessageImage()}
              {this.renderMessageText()}
              <View style={[styles.bottom, bottomContainerStyle[position]]}>
                {this.renderTime()}
                {this.renderTicks()}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

Bubble.contextTypes = {
  actionSheet: PropTypes.func,
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTime: null,
  renderTicks: null,
  position: 'left',
  user: null,
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
  // TODO: remove in next major release
  isSameDay: warnDeprecated(isSameDay),
  isSameUser: warnDeprecated(isSameUser),
};

Bubble.propTypes = {
  user: PropTypes.object,
  touchableProps: PropTypes.object,
  renderTicks: PropTypes.func,
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderTime: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  wrapperStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  bottomContainerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  tickStyle: Text.propTypes.style,
  containerToNextStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  // TODO: remove in next major release
  isSameDay: PropTypes.func,
  isSameUser: PropTypes.func,
};
