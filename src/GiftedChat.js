import React from 'react';
import {
  Animated,
  StyleSheet,
  View,
  TextInput,
} from 'react-native';
import PropTypes from 'prop-types';

// import ActionSheet from '@expo/react-native-action-sheet';
import moment from 'moment';
import uuid from 'uuid';

import * as utils from './utils';
import Actions from './Actions';
import Avatar from './Avatar';
import Bubble from './Bubble';
import MessageImage from './MessageImage';
import MessageText from './MessageText';
import Composer from './Composer';
import Day from './Day';
import InputToolbar from './InputToolbar';
import LoadEarlier from './LoadEarlier';
import Message from './Message';
import MessageContainer from './MessageContainer';
import Send from './Send';
import Time from './Time';
import GiftedAvatar from './GiftedAvatar';
// import GiftedChatInteractionManager from './GiftedChatInteractionManager';

// Min and max heights of ToolbarInput and Composer
// Needed for Composer auto grow and ScrollView animation
// TODO move these values to Constants.js (also with used colors #b2b2b2)
const MIN_COMPOSER_HEIGHT = 50;
const MAX_COMPOSER_HEIGHT = 50;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  messageFlex: {
    display: 'flex',
  },
});

class GiftedChat extends React.Component {
  static append(currentMessages = [], messages) {
    let appMessages = messages;

    if (!Array.isArray(messages)) {
      appMessages = [messages];
    }
    return appMessages.concat(currentMessages);
  }

  static prepend(currentMessages = [], messages) {
    let prepMessages = messages;

    if (!Array.isArray(messages)) {
      prepMessages = [messages];
    }
    return currentMessages.concat(prepMessages);
  }

  constructor(props) {
    super(props);

    this.state = {
      isInitialized: false, // initialization will calculate maxHeight before rendering the chat
      composerHeight: MIN_COMPOSER_HEIGHT,
      messagesContainerHeight: null,
      typingDisabled: false,
      isMounted: false,
      bottomOffset: props.bottomOffset || 0,
      maxHeight: null,
      isFirstLayout: true,
      locale: 'en',
      messages: [],
    };

    this.onSend = this.onSend.bind(this);
    this.onInputSizeChanged = this.onInputSizeChanged.bind(this);
    this.onInputTextChanged = this.onInputTextChanged.bind(this);
    this.onInitialLayoutViewLayout = this.onInitialLayoutViewLayout.bind(this);

    this.invertibleScrollViewProps = {
      inverted: true,
    };
  }

  componentWillMount() {
    this.setState({ isMounted: true });
    this.initLocale();
    this.initMessages(this.props.messages);
  }

  componentWillReceiveProps(nextProps = {}) {
    this.initMessages(nextProps.messages);
  }

  componentWillUnmount() {
    this.setState({ isMounted: false });
  }

  onSend(messages = [], shouldResetInputToolbar = false) {
    const { user, messageIdGenerator, onSend } = this.props;
    const { isMounted } = this.state;

    let newMessages = messages;

    if (!Array.isArray(messages)) {
      newMessages = [messages];
    }

    newMessages = newMessages.map((message) => {
      return {
        ...message,
        user,
        createdAt: new Date(),
        _id: messageIdGenerator(),
      };
    });

    if (shouldResetInputToolbar === true) {
      this.setState({ typingDisabled: true });
      this.resetInputToolbar();
    }

    onSend(newMessages);
    this.scrollToBottom();

    if (shouldResetInputToolbar === true) {
      setTimeout(() => {
        if (isMounted === true) {
          this.setState({ typingDisabled: false });
        }
      }, 100);
    }
  }

  onInputSizeChanged(size) {
    const newComposerHeight = Math.max(MIN_COMPOSER_HEIGHT, Math.min(MAX_COMPOSER_HEIGHT, size.height));
    const newMessagesContainerHeight = this.getMessagesContainerHeight(newComposerHeight);

    this.setState({
      composerHeight: newComposerHeight,
      messagesContainerHeight: this.prepareMessagesContainerHeight(newMessagesContainerHeight),
    });
  }

  onInputTextChanged(text) {
    const { typingDisabled } = this.state;
    const { onInputTextChanged } = this.props;

    if (typingDisabled) {
      return;
    }
    if (onInputTextChanged) {
      onInputTextChanged(text);
    }
    this.setState({ text });
  }

  onInitialLayoutViewLayout() {
    const newComposerHeight = MIN_COMPOSER_HEIGHT;
    const newMessagesContainerHeight = this.getMessagesContainerHeight(newComposerHeight);

    this.setState({
      maxHeight: 500,
      isInitialized: true,
      text: '',
      composerHeight: newComposerHeight,
      messagesContainerHeight: this.prepareMessagesContainerHeight(newMessagesContainerHeight),
    });
  }

  /**
   * Returns the height, based on current window size
   */
  getMessagesContainerHeight(composerHeight) {
    const { renderAccessory, minInputToolbarHeight } = this.props;
    const { maxHeight, bottomOffset } = this.state;

    const minHeight = renderAccessory ? minInputToolbarHeight * 2 : minInputToolbarHeight;
    const inputHeight = composerHeight + (minHeight - MIN_COMPOSER_HEIGHT);

    return maxHeight - (inputHeight + bottomOffset);
  }

  initLocale() {
    const { locale } = this.props;

    if (locale === null || moment.locales().indexOf(locale) === -1) {
      this.setState({ locale: 'en' });
    } else {
      this.setState({ locale });
    }
  }

  initMessages(messages = []) {
    this.setState({ messages });
  }
  prepareMessagesContainerHeight(value) {
    const { isAnimated } = this.props;

    if (isAnimated === true) {
      return new Animated.Value(value);
    }
    return value;
  }

  scrollToBottom(animated = true) {
    if (this.messageContainerRef !== null) {
      this.messageContainerRef.scrollTo({
        y: 0,
        animated,
      });
    }
  }

  resetInputToolbar() {
    if (this.textInput) {
      this.textInput.clear();
    }
    const newComposerHeight = MIN_COMPOSER_HEIGHT;
    const newMessagesContainerHeight = this.getMessagesContainerHeight(newComposerHeight);
    this.setState({
      text: '',
      composerHeight: newComposerHeight,
      messagesContainerHeight: this.prepareMessagesContainerHeight(newMessagesContainerHeight),
    });
  }

  renderMessages() {
    const { messages, messagesContainerHeight } = this.state;

    return (
      <View style={[styles.messageFlex, { height: messagesContainerHeight }]}>
        <MessageContainer
          {...this.props}
          invertibleScrollViewProps={this.invertibleScrollViewProps}
          messages={messages}
          ref={(component) => { this.messageContainerRef = component; }}
        />
        {this.renderChatFooter()}
      </View>
    );
  }


  renderInputToolbar() {
    const { text, typingDisabled } = this.state;

    const {
      textInputProps,
      renderInputToolbar,
    } = this.props;

    const inputToolbarProps = {
      ...this.props,
      text,
      onSend: this.onSend,
      onInputSizeChanged: this.onInputSizeChanged,
      onTextChanged: this.onInputTextChanged,
      textInputProps: {
        ...textInputProps,
        ref: (textInput) => { this.textInput = textInput; },
        maxLength: typingDisabled ? 0 : textInputProps.maxInputLength,
      },
    };

    if (typingDisabled) {
      inputToolbarProps.textInputProps.maxLength = 0;
    }

    if (renderInputToolbar) {
      return renderInputToolbar(inputToolbarProps);
    }

    return (
      <InputToolbar
        {...inputToolbarProps}
      />
    );
  }

  renderChatFooter() {
    const { renderChatFooter } = this.props;

    if (renderChatFooter) {
      const footerProps = {
        ...this.props,
      };
      return renderChatFooter(footerProps);
    }
    return null;
  }

  renderLoading() {
    const { renderLoading } = this.props;

    if (renderLoading) {
      return renderLoading();
    }

    return null;
  }

  render() {
    const { isInitialized } = this.state;

    if (isInitialized === true) {
      return (
        <View style={styles.container}>
          {this.renderMessages()}
          {this.renderInputToolbar()}
        </View>
      );
    }

    return (
      <View style={styles.container} onLayout={this.onInitialLayoutViewLayout}>
        {this.renderLoading()}
      </View>
    );
  }
}

GiftedChat.defaultProps = {
  messages: [],
  onSend: () => {
  },
  loadEarlier: false,
  onLoadEarlier: () => {
  },
  locale: null,
  isAnimated: false,
  keyboardShouldPersistTaps: 'never',
  renderAccessory: null,
  renderActions: null,
  renderAvatar: undefined,
  renderBubble: null,
  renderFooter: null,
  renderChatFooter: null,
  renderMessageText: null,
  renderMessageImage: null,
  renderComposer: null,
  renderCustomView: null,
  renderDay: null,
  renderInputToolbar: null,
  renderLoadEarlier: null,
  renderLoading: null,
  renderMessage: null,
  renderSend: null,
  renderTime: null,
  user: {},
  bottomOffset: 0,
  minInputToolbarHeight: 44,
  isLoadingEarlier: false,
  messageIdGenerator: () => uuid.v4(),
  maxInputLength: null,
  onInputTextChanged: null,
  textInputProps: {},
};

GiftedChat.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  onSend: PropTypes.func,
  onInputTextChanged: PropTypes.func,
  textInputProps: PropTypes.object,
  // loadEarlier: PropTypes.bool,
  // onLoadEarlier: PropTypes.func,
  locale: PropTypes.string,
  isAnimated: PropTypes.bool,
  renderAccessory: PropTypes.func,
  // renderActions: PropTypes.func,
  // renderAvatar: PropTypes.func,
  // renderBubble: PropTypes.func,
  // renderFooter: PropTypes.func,
  renderChatFooter: PropTypes.func,
  // renderMessageText: PropTypes.func,
  // renderMessageImage: PropTypes.func,
  // renderComposer: PropTypes.func,
  // renderCustomView: PropTypes.func,
  // renderDay: PropTypes.func,
  renderInputToolbar: PropTypes.func,
  // renderLoadEarlier: PropTypes.func,
  renderLoading: PropTypes.func,
  // renderMessage: PropTypes.func,
  // renderSend: PropTypes.func,
  // renderTime: PropTypes.func,
  user: PropTypes.object,
  bottomOffset: PropTypes.number,
  minInputToolbarHeight: PropTypes.number,
  // isLoadingEarlier: PropTypes.bool,
  messageIdGenerator: PropTypes.func,
};

export {
  GiftedChat,
  Actions,
  Avatar,
  Bubble,
  MessageImage,
  MessageText,
  Composer,
  Day,
  InputToolbar,
  LoadEarlier,
  Message,
  MessageContainer,
  Send,
  Time,
  GiftedAvatar,
  utils,
};
