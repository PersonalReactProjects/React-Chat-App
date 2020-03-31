import React, { Component } from 'react'
import io from 'socket.io-client'
import { USER_CONNECTED, LOGOUT } from '../Events'
import LoginForm from './LoginForm'
import ChatContainer from './chats/ChatContainer'

class Layout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            socket: null,
            user: null,
            socketURL: "http://localhost:3231"

        }
    }
    componentDidMount() {
        this.initSocket()
    }

    initSocket = () => {
        const { socketURL } = this.state
        const socket = io(socketURL)

        socket.on('connect', () => {
            console.log("Socket Connected")
        })
        this.setState({ socket: socket })
    }
    /*
    * sETS THE USER PROPERTY IN STATE
    * @PARAM USER {ID: NUMBER NAME: STRING}
    * 
    */

    setUser = (user) => {
        const { socket } = this.state
        socket.emit(USER_CONNECTED, user)
        this.setState({ user: user })
    }


    /*
    * SETS THE USER PROPERTY IN STATE TO NULL
    */
    logout = () => {
        const { socket } = this.state
        socket.emit(LOGOUT)
        this.setState({ user: null })
    }



    render() {
        const { socket,  user} = this.state
        const { title } = this.props
        return (
            <div className="container">
                {
                    !user ? <LoginForm socket={socket} setUser={this.setUser} /> :
                        <ChatContainer socket={socket} user={user} logout={this.logout}/>
                }
            </div>
        )
    }
}
export default Layout
