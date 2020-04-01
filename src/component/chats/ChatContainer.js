import React, { Component } from 'react';
import PropTypes from 'prop-types'
import SideBar from './SideBar'
import { User } from '../../Factories'
import Messages from '../messaging/Messages'
import MessageInput from '../messaging/MessageInput'
import ChatHeading from './ChatHeading'
import { COMMUNITY_CHAT, MESSAGE_RECIEVED, MESSAGE_SENT, TYPING, PRIVATE_MESSAGING } from '../../Events'




class ChatContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            chats: [],
            activeChat: null
        }
    }

    componentDidMount = () => {
        const { socket } = this.props
        // socket.emit(COMMUNITY_CHAT, this.resetChat)
        this.initSocket(socket)

    }

    initSocket = (socket) => {
        socket.emit(COMMUNITY_CHAT, this.resetChat)
        socket.on(PRIVATE_MESSAGING, this.addChat)
        socket.on('connect', () => {
            socket.emit(COMMUNITY_CHAT, this.resetChat)
        })
        // socket.emit(PRIVATE_MESSAGING, {receiver: "mike", sender: this.props.user.name})
    }

    sendOpenPrivateMessage = (receiver) => {
        const { socket, user } = this.props
        const { activeChat } = this.state
        socket.emit(PRIVATE_MESSAGING, { receiver: receiver, sender: user.name, activeChat })
        
    } 

    resetChat = (chat) => {   
        return this.addChat(chat, true)
    }

    addChat = (chat, reset=false) => {
        console.log(chat)
        const { socket } = this.props
        const { chats } = this.state
 
        const newChats = reset ? [chat] : [...chats, chat]

        this.setState({ chats: newChats, activeChat: chat })

        const messageEvent = `${MESSAGE_RECIEVED}-${chat.id}`
        const typingEvent = `${TYPING}-${chat.id}`

        socket.on(messageEvent, this.addMessageToChat(chat.id))
        socket.on(typingEvent, this.updateTypingInChat(chat.id))

        // this.socketEvents.push(messageEvent, typingEvent) // used to remove event listerners
    }

    /*
	* Adds message to chat 
	* @param chatId {number}
	*/
    addMessageToChat(chatId) {
        return message => {
            const { chats } = this.state
            let newChats = chats.map((chat) => {
                if (chat.id === chatId)
                    chat.messages.push(message)
                return chat;
            })
            this.setState({ chats: newChats })
        }
    }

	/*
	*	Updates the typing of chat with id passed in.
	*	@param chatId {number}
	*/
    updateTypingInChat(chatId) {
        return ({ isTyping, user }) => {
            if (user !== this.props.user.name) {

                const { chats } = this.state
                let newChats = chats.map((chat) => {
                    if (chat.id === chatId) {
                        if (isTyping && !chat.typingUsers.includes(user))
                            chat.typingUsers.push(user)
                        else if (!isTyping && chat.typingUsers.includes(user))
                            chat.typingUsers = chat.typingUsers.filter(u => u !== user)
                    }
                    return chat;
                })
                this.setState({ chats: newChats })
            }
        }
    }

    setActiveChat = (activeChat) => {
        this.setState({activeChat: activeChat})
    }

    sendMessage = (chatId, message) => {
        const { socket } = this.props
        socket.emit(MESSAGE_SENT, { chatId, message})
    }

    sendTyping = (chatId, isTyping) => {
        const { socket } = this.props
        socket.emit(TYPING, { chatId, isTyping }) 
    }


    render() {
        const { user, logout } = this.props
        const { chats, activeChat } = this.state
        return (
            <div className="container">
                <SideBar 
                    logout={logout}
                    chats={chats}
                    user={user}
                    activeChat={activeChat}
                    setActiveChat={this.setActiveChat}
                    onSendPrivateMessage={this.sendOpenPrivateMessage}
                    />

                <div className="chat-room-container">
                    {
                        activeChat !== null ? (

                        <div className="chat-room">
                                <ChatHeading name={activeChat.name} />
                                <Messages
                                    messages={activeChat.messages}
                                    user={user}
                                    typingUsers={activeChat.typingUsers}
                                />
                                <MessageInput 
                                    sendMessage={
                                        (message) => {
                                          this.sendMessage(activeChat.id, message)
                                      }  
                                    }
                                    sendTyping={
                                        (isTyping) => {
                                          this.sendTyping(activeChat.id, isTyping)
                                      }
                                   } 
                                />

                        </div>  
                        ) :
                            <div className="chat-room choose">
                                <h3>Choose a chat</h3>
                            </div>
                    } 
                </div>
            </div>
        )
    }
}
ChatContainer.propTypes = {
    socket: PropTypes.object,
    user: PropTypes.shape(User).isRequired
}

export default ChatContainer
