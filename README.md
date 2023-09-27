<div align="center">
<h3 align="center">WebRTC-Chat</h3>

  <p align="center">
    This project leverages WebRTC(Web Real-Time Communication) to enable seamless real-time video and audio communication via a peer-to-peer connection. 
    <br />
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

This project is a comprehensive demonstration of the WebRTC API and various concepts behind establishing a Peer-to-Peer connection.

`A Peer connection is part of the WebRTC specifications that deals with connecting two applications on different computers using a Peer-to-Peer protocol.
The communication between peers can be video, audio, or arbitrary binary data.`

In order to create peer-to-peer connections, a multitude of processes must take place beforehand.

1. <strong>User must generate a Peer</strong> 
2. <strong>User's media stream must be obtained</strong>
3. <strong>User must generate and send ICE candidates to another Peer</strong>
4. <strong>User must set Local and Remote SDP's via offer/answer system</strong>

Only once User's exchange ICE candidates and set their local and remote SDP's, WebRTC can establish a Peer-to-Peer connection and exchange data/media streams over UDP.

Here's a interactive program to help you conceptualize these processes(without signaling): https://divanov11.github.io/WebRTC-Simple-SDP-Handshake-Demo/
Read more on media streams, ICE candidates, STUN and TURN servers, and Local/Remote SDPs here: https://webrtc.org/getting-started/overview

This project also includes a signaling server that aids with the proccesses above. The signaling server utilizes the Socket.io API to enable real-time, bidrectional, and event-based communication between the server and clients. 
This API is used to emit to Users room events as well as to handle offer/answer events when establishing Peer-to-Peer connections. 

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![React][React.js]][React-url]
* [![Node][Node.js]][Node-url]
* [![WebRTC]][WebRTC-url]
* [![Socket.io]][Socket.io-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

After cloning, `cd` to the repository and run `yarn install` in both the root and client directory. This is install all dependencies for this project. Ensure you have `yarn` installed before this step.

Once all dependencies are installed, you will need to create two `.env` files: one in the root directory and one in the client directory.
* /root
  ```sh
  CLIENT_URL="http://localhost:YOUR_REACT_PORT"
  ```
* /client
  ```sh
  REACT_APP_SERVER_URL="http://localhost:YOUR_NODE_SERVER_PORT"
  ```
* If you intend on deploying this app, you will need to provide your TURN server's url and credentials (you can either pay for a TURN server or set one up yourself using coTURN). /client
  ```sh
  REACT_APP_TURN_URL="turn:YOUR_TURN_SERVER_HOSTNAME/IP_ADDRESS:YOUR_TURN_SERVER_PORT"
  REACT_APP_TURN_USERNAME="YOUR_TURN_SERVER_USERNAME"
  REACT_APP_TURN_CREDENTIAL="YOUR_TURN_SERVER_PASSWORD"
  ```
* If you only plan on demo-ing this app, remove the TURN server configurations by commenting out lines 20-24 in `/client/src/routes/Room.js`.
  
Once all dependencies have been installed and all environment variables are initialized, you are ready to run the project.

Start the server by running `yarn start` in the root directory.

Start the client-side application by running `yarn start` in the client directory. 

Navigate to `http://localhost:YOUR_REACT_PORT`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

This project foucuses on the essential features required to establish peer-topeer connections using WebRTC, enabling users in remote locations to share audio and video in real time.
The current implementation serves as a robust foundation for a wide range of potential use cases and can be expanded upon to create diverse real-time communication applications.

Current Features:
* Real-time peer-to-peer audio and video communication.
* Seamless integration of WebRTC for low-latency connections.
* Signal server powered by Node.js and Socket.io for effective signaling between peers.
* Utilization of STUN and TURN servers to ensure connectivity in various network environments.

Potential Use Cases:
* Livestreaming Platform: Enhance the project to support broadcasting, viewer interaction, and content monetization, paving the way for a feature-rich livestreaming platform.
* Livestreaming Auction Platform: Build upon the core functionality to facilitate real-time auctions, where participants can engage via audio and video to make bids.
* Messaging Platform: Extend the project to include text-based messaging alongside audio and video communication, creating a comprehensive messaging solution.
* Chatroom Platform: Implement chatroom features to enable multiple users to participate in group discussions alongside video and audio sharing.
* Custom Real-Time Applications: Leverage the WebRTC foundation to develop unique real-time applications tailored to specific needs, such as collaborative tools, educational platforms, or telehealth solutions


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Minsung - kmaxsung@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* Checkout Dennis Ivy's YouTube video for a more conceptual understanding of signaling servers and WebRTC: https://www.youtube.com/watch?v=8I2axE6j204&t=3658s&ab_channel=DennisIvy
* Checkout Engineering Semester's YouTube playlist for more on WebRTC: https://www.youtube.com/watch?v=jUh9RlO8y18&list=PL34gl7XmgyxT4p6-nMgddxdl18S1Xpczr&ab_channel=EngineeringSemester
* Checkout Awesome Open Source's YouTube video for how to setup your own TURN server (On the video he left 'relay_ip' commented out, but you should uncomment that option and set it to your public ip address): https://www.youtube.com/watch?v=eZ9Jrxy6NVM&t=1586s&ab_channel=AwesomeOpenSource


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/github_username/repo_name/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/github_username/repo_name/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/github_username/repo_name/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/github_username/repo_name/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/github_username/repo_name/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Node.js]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/en
[Socket.io]: https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101
[Socket.io-url]: https://socket.io/
[WebRTC]: https://img.shields.io/badge/WebRTC-333?logo=webrtc&logoColor=fff&style=for-the-badge
[WebRTC-url]: https://webrtc.org/
