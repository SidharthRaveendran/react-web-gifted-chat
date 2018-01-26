import React from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
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
import GiftedChatInteractionManager from './GiftedChatInteractionManager';

// Min and max heights of ToolbarInput and Composer
// Needed for Composer auto grow and ScrollView animation
// TODO move these values to Constants.js (also with used colors #b2b2b2)
const MIN_COMPOSER_HEIGHT = 50;
const MAX_COMPOSER_HEIGHT = 50;

class GiftedChat extends React.Component {
  constructor(props) {
    super(props);

    // default values
    this._isMounted = false;
    this._bottomOffset = 0;
    this._maxHeight = null;
    this._isFirstLayout = true;
    this._locale = 'en';
    this._messages = [];

    this.state = {
      isInitialized: false, // initialization will calculate maxHeight before rendering the chat
      composerHeight: MIN_COMPOSER_HEIGHT,
      messagesContainerHeight: null,
      typingDisabled: false
    };

    this.onSend = this.onSend.bind(this);
    this.getLocale = this.getLocale.bind(this);
    this.onInputSizeChanged = this.onInputSizeChanged.bind(this);
    this.onInputTextChanged = this.onInputTextChanged.bind(this);
    this.onMainViewLayout = this.onMainViewLayout.bind(this);
    this.onInitialLayoutViewLayout = this.onInitialLayoutViewLayout.bind(this);

    this.invertibleScrollViewProps = {
      inverted: true,
    };
  }

  static append(currentMessages = [], messages) {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }
    return messages.concat(currentMessages);
  }

  static prepend(currentMessages = [], messages) {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }
    return currentMessages.concat(messages);
  }

  getChildContext() {
    return {
      getLocale: this.getLocale,
    };
  }

  componentWillMount() {
    this.setIsMounted(true);
    this.initLocale();
    this.initMessages(this.props.messages);
  }

  componentWillUnmount() {
    this.setIsMounted(false);
  }

  componentWillReceiveProps(nextProps = {}) {
    this.initMessages(nextProps.messages);
  }

  initLocale() {
    if (this.props.locale === null || moment.locales().indexOf(this.props.locale) === -1) {
      this.setLocale('en');
    } else {
      this.setLocale(this.props.locale);
    }
  }

  initMessages(messages = []) {
    this.setMessages(messages);
  }

  setLocale(locale) {
    this._locale = locale;
  }

  getLocale() {
    return this._locale;
  }

  setMessages(messages) {
    this._messages = messages;
  }

  getMessages() {
    return this._messages;
  }

  setMaxHeight(height) {
    this._maxHeight = height;
  }

  getMaxHeight() {
    return this._maxHeight;
  }

  setBottomOffset(value) {
    this._bottomOffset = value;
  }

  getBottomOffset() {
    return this._bottomOffset;
  }

  setIsFirstLayout(value) {
    this._isFirstLayout = value;
  }

  getIsFirstLayout() {
    return this._isFirstLayout;
  }

  setIsTypingDisabled(value) {
    this.setState({
      typingDisabled: value
    });
  }

  getIsTypingDisabled() {
    return this.state.typingDisabled;
  }

  setIsMounted(value) {
    this._isMounted = value;
  }

  getIsMounted() {
    return this._isMounted;
  }

  /**
   * Returns the height, based on current window size
   */

  getMessagesContainerHeight(composerHeight) {
    const { renderAccessory, minInputToolbarHeight } = this.props

    const minHeight = renderAccessory ? minInputToolbarHeight * 2 : minInputToolbarHeight
    const inputHeight = composerHeight + (minHeight - MIN_COMPOSER_HEIGHT);

    return this.getMaxHeight() - inputHeight + this.getBottomOffset();
  }

  prepareMessagesContainerHeight(value) {
    if (this.props.isAnimated === true) {
      return new Animated.Value(value);
    }
    return value;
  }

  scrollToBottom(animated = true) {
    if (this._messageContainerRef === null) {
      return
    }
    this._messageContainerRef.scrollTo({
      y: 0,
      animated,
    });
  }

  renderMessages() {
    return (
      <div style={{
        height: this.state.messagesContainerHeight,
        display: 'flex'
      }}>
        <MessageContainer
          {...this.props}
          invertibleScrollViewProps={this.invertibleScrollViewProps}
          messages={this.getMessages()}
          ref={component => this._messageContainerRef = component}
        />
        {this.renderChatFooter()}
      </div>
    );
  }

  onSend(messages = [], shouldResetInputToolbar = false) {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }

    messages = messages.map((message) => {
      return {
        ...message,
        user: this.props.user,
        createdAt: new Date(),
        _id: this.props.messageIdGenerator(),
      };
    });

    if (shouldResetInputToolbar === true) {
      this.setIsTypingDisabled(true);
      this.resetInputToolbar();
    }

    this.props.onSend(messages);
    this.scrollToBottom();

    if (shouldResetInputToolbar === true) {
      setTimeout(() => {
        if (this.getIsMounted() === true) {
          this.setIsTypingDisabled(false);
        }
      }, 100);
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

  onInputSizeChanged(size) {
    
    const newComposerHeight = Math.max(MIN_COMPOSER_HEIGHT, Math.min(MAX_COMPOSER_HEIGHT, size.height));
    const newMessagesContainerHeight = this.getMessagesContainerHeight(newComposerHeight);
    
    this.setState({
      composerHeight: newComposerHeight,
      messagesContainerHeight: this.prepareMessagesContainerHeight(newMessagesContainerHeight),
    });

  }

  onInputTextChanged(text) {
    if (this.getIsTypingDisabled()) {
      return;
    }
    if (this.props.onInputTextChanged) {
      this.props.onInputTextChanged(text);
    }
    this.setState({text});
  }

  onInitialLayoutViewLayout(e) {
    const { layout } = e.nativeEvent;

    this.setMaxHeight(1000);
    
    const newComposerHeight = MIN_COMPOSER_HEIGHT;
    const newMessagesContainerHeight = this.getMessagesContainerHeight(newComposerHeight);
    
    this.setState({
      isInitialized: true,
      text: '',
      composerHeight: newComposerHeight,
      messagesContainerHeight: this.prepareMessagesContainerHeight(newMessagesContainerHeight),
    });
  }

  onMainViewLayout(e) {
    const { layout } = e.nativeEvent;

    if (this.getMaxHeight() !== layout.height || this.getIsFirstLayout() === true) {
      this.setMaxHeight(layout.height);
      this.setState({
        messagesContainerHeight: this.prepareMessagesContainerHeight(this.getMessagesContainerHeight()),
      });
    }

    if (this.getIsFirstLayout() === true) {
      this.setIsFirstLayout(false);
    }
  }

  renderInputToolbar() {

    const { text } = this.state
    
    const {
      textInputProps,
      maxInputLength,
      renderInputToolbar
    } = this.props

    const inputToolbarProps = {
      ...this.props,
      text: text,
      onSend: this.onSend,
      onInputSizeChanged: this.onInputSizeChanged,
      onTextChanged: this.onInputTextChanged,
      textInputProps: {
        ...textInputProps,
        ref: textInput => this.textInput = textInput,
        maxLength: this.getIsTypingDisabled() ? 0 : maxInputLength
      }
    };

    if (this.getIsTypingDisabled()) {
      inputToolbarProps.textInputProps.maxLength = 0;
    }

    if (this.props.renderInputToolbar) {
      return renderInputToolbar(inputToolbarProps);
    }

    return (
      <InputToolbar
        {...inputToolbarProps}
      />
    );
  }

  renderChatFooter() {

    const { renderChatFooter } = this.props

    if (renderChatFooter) {
      const footerProps = {
        ...this.props,
      };
      return renderChatFooter(footerProps);
    }
    return null;
  }

  renderLoading() {

    const { renderLoading } = this.props

    if (renderLoading) {
      return renderLoading();
    }

    return null;
  }

  render() {

    if (this.state.isInitialized === true) {
      return (
        <View style={styles.container} onLayout={this.onMainViewLayout}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%'
  },
});

GiftedChat.childContextTypes = {
  getLocale: PropTypes.func,
};

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
  maxInputLength: null
};

GiftedChat.propTypes = {
  messages: PropTypes.array,
  onSend: PropTypes.func,
  onInputTextChanged: PropTypes.func,
  loadEarlier: PropTypes.bool,
  onLoadEarlier: PropTypes.func,
  locale: PropTypes.string,
  isAnimated: PropTypes.bool,
  renderAccessory: PropTypes.func,
  renderActions: PropTypes.func,
  renderAvatar: PropTypes.func,
  renderBubble: PropTypes.func,
  renderFooter: PropTypes.func,
  renderChatFooter: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderComposer: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderDay: PropTypes.func,
  renderInputToolbar: PropTypes.func,
  renderLoadEarlier: PropTypes.func,
  renderLoading: PropTypes.func,
  renderMessage: PropTypes.func,
  renderSend: PropTypes.func,
  renderTime: PropTypes.func,
  user: PropTypes.object,
  bottomOffset: PropTypes.number,
  minInputToolbarHeight: PropTypes.number,
  isLoadingEarlier: PropTypes.bool,
  messageIdGenerator: PropTypes.func,
  keyboardShouldPersistTaps: PropTypes.oneOf(['always', 'never', 'handled']),
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
  utils
};
