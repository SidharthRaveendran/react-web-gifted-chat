import React from 'react';
import {
  View,
  ViewPropTypes,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Avatar from './Avatar';
import Bubble from './Bubble';
import Day from './Day';

import { isSameUser, isSameDay } from './utils';

const styles = {
  left: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      marginLeft: 8,
      marginRight: 0,
    },
  }),
  right: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      marginLeft: 0,
      marginRight: 8,
    },
  }),
};

export default class Message extends React.Component {

  getInnerComponentProps() {
    const { containerStyle, ...props } = this.props;
    return {
      ...props,
      isSameUser,
      isSameDay,
    };
  }

  renderDay() {
    const { currentMessage, renderDay } = this.props;

    if (currentMessage.createdAt) {
      const dayProps = this.getInnerComponentProps();
      if (renderDay) {
        return renderDay(dayProps);
      }
      return <Day {...dayProps} />;
    }
    return null;
  }

  renderBubble() {
    const { renderBubble } = this.props;
    const bubbleProps = this.getInnerComponentProps();

    if (renderBubble) {
      return renderBubble(bubbleProps);
    }
    return <Bubble {...bubbleProps} />;
  }

  renderAvatar() {
    const avatarProps = this.getInnerComponentProps();

    return <Avatar {...avatarProps} />;
  }

  render() {
    const { position, currentMessage, nextMessage, containerStyle } = this.props;
    
    return (
      <View>
        {this.renderDay()}
        <View style={[styles[position].container, {
          marginTop: isSameUser(currentMessage, nextMessage) ? 2 : 10,
        }, containerStyle[this.props.position]]}
        >
          {position === 'left' ? this.renderAvatar() : null}
          {this.renderBubble()}
          {position === 'right' ? this.renderAvatar() : null}
        </View>
      </View>
    );
  }
}

Message.defaultProps = {
  renderAvatar: undefined,
  renderBubble: null,
  renderDay: null,
  position: 'left',
  currentMessage: {},
  nextMessage: {},
  previousMessage: {},
  user: {},
  containerStyle: {},
};

Message.propTypes = {
  renderAvatar: PropTypes.func,
  renderBubble: PropTypes.func,
  renderDay: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  user: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
};
