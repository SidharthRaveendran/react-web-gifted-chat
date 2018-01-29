import React from 'react';

import {
  ListView,
  View,
  ScrollView
} from 'react-native';

import PropTypes from 'prop-types';
import shallowequal from 'shallowequal';
import md5 from 'md5';
import LoadEarlier from './LoadEarlier';
import Message from './Message';

export default class MessageContainer extends React.Component {
  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderLoadEarlier = this.renderLoadEarlier.bind(this);
    this.renderScrollComponent = this.renderScrollComponent.bind(this);

    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        return r1.hash !== r2.hash;
      },
    });

    const messagesData = this.prepareMessages(props.messages);
    this.state = {
      dataSource: dataSource.cloneWithRows(messagesData.blob, messagesData.keys),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!shallowequal(this.props, nextProps)) {
      return true;
    }
    if (!shallowequal(this.state, nextState)) {
      return true;
    }
    return false;
  }

  componentWillReceiveProps(nextProps) {
    const { messages } = this.props;
    const { dataSource } = this.state;

    if (messages === nextProps.messages) {
      return;
    }
    const messagesData = this.prepareMessages(nextProps.messages);
    this.setState({
      dataSource: dataSource.cloneWithRows(messagesData.blob, messagesData.keys),
    });
  }

  prepareMessages(messages) {
    return {
      keys: messages.map((m) => m._id),
      blob: messages.reduce((o, m, i) => {
        const previousMessage = messages[i + 1] || {};
        const nextMessage = messages[i - 1] || {};
        // add next and previous messages to hash to ensure updates
        const toHash = JSON.stringify(m) + previousMessage._id + nextMessage._id;
        o[m._id] = {
          ...m,
          previousMessage,
          nextMessage,
          hash: md5(toHash),
        };
        return o;
      }, {}),
    };
  }

  scrollTo(options) {
    return options;
    // this._invertibleScrollViewRef.scrollTo(options);
  }

  renderFooter() {
    const { renderFooter } = this.props;

    if (renderFooter) {
      const footerProps = {
        ...this.props,
      };
      return renderFooter(footerProps);
    }
    return null;
  }

  renderLoadEarlier() {
    const { loadEarlier, renderLoadEarlier } = this.props;

    if (loadEarlier) {
      if (renderLoadEarlier) {
        return renderLoadEarlier(...this.props);
      }
      return (
        <LoadEarlier {...this.props} />
      );
    }
    return null;
  }

  renderRow(message) {
    const { user, renderMessage } = this.props;

    if (!message._id && message._id !== 0) {
      console.warn('GiftedChat: `_id` is missing for message', JSON.stringify(message));
    }
    if (!message.user) {
      console.warn('GiftedChat: `user` is missing for message', JSON.stringify(message));
      message.user = {};
    }

    const messageProps = {
      ...this.props,
      key: message._id,
      currentMessage: message,
      previousMessage: message.previousMessage,
      nextMessage: message.nextMessage,
      position: message.user._id === user._id ? 'right' : 'left',
    };

    if (renderMessage) {
      return renderMessage(messageProps);
    }
    return <Message {...messageProps} />;
  }

  renderScrollComponent(props) {
    const { invertibleScrollViewProps } = this.props;

    return (
      <ScrollView
        {...props}
        // {...invertibleScrollViewProps}
      />
    );
  }


  render() {
    const { listViewProps } = this.props;
    const { dataSource } = this.state;

    return (
      <View
        style={{ flex: 1 }}
        onLayout={() => {
          this._scrollView.scrollToEnd();
        }
      }
      >
        <ListView
          enableEmptySections
          automaticallyAdjustContentInsets={false}
          initialListSize={20}
          pageSize={20}

          ref={(component) => {
            if (component) {
              this._scrollView = component._scrollViewRef;
            }
          }}
          {...listViewProps}
          onContentSizeChange={() => this._scrollView.scrollToEnd()}
          dataSource={dataSource}
          renderScrollComponent={this.renderScrollComponent}
          renderRow={this.renderRow}
          renderHeader={this.renderFooter}
          renderFooter={this.renderLoadEarlier}
        />
      </View>
    );
  }
}

MessageContainer.defaultProps = {
  messages: [],
  user: {},
  renderFooter: null,
  renderMessage: null,
  listViewProps: {},
  renderLoadEarlier: () => {
  },
  loadEarlier: false,
  invertibleScrollViewProps: null,
};

MessageContainer.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
  renderFooter: PropTypes.func,
  renderMessage: PropTypes.func,
  renderLoadEarlier: PropTypes.func,
  listViewProps: PropTypes.object,
  loadEarlier: PropTypes.bool,
  invertibleScrollViewProps: PropTypes.object,
};
