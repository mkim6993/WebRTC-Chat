import React, { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const Room = (props) => {
    const { roomID } = useParams();
    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();
    const socketRef = useRef();
    const otherUser = useRef();
    const userStream = useRef();
    const errID = useRef()

    useEffect(() => {
        errID.current = 0
        console.log("useEffect");
        navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        }).then(stream => {
            // set up current user's stream
            console.log("userVideo:", userVideo);
            userVideo.current.srcObject = stream;
            userStream.current = stream;
            userVideo.current.muted = true;

            // connect to socket server and emit 'join-room'
            socketRef.current = io.connect("/");
            socketRef.current.emit("join-room", roomID);
            console.log("join-room")
            /**
             * when other user joins, given new user's ID, call new user
             * For user that is joining  
             */ 
            socketRef.current.on("other-user", userID => {
                callUser(userID);
                otherUser.current = userID; // store new userID in otherUser ref
            });

            /**
             * For user that is already in the room
             */
            socketRef.current.on("user-joined", userID => {
                otherUser.current = userID;
            });

            socketRef.current.on("offer", handleReceiveCall);

            socketRef.current.on("answer", handleAnswer);

            socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
        });
    }, []);

    /**
     * creates peer object, attaches current user's stream data to peer object
     * @param { ID of call recipient } userID 
     */
    function callUser(userID) {
        peerRef.current = createPeer(userID);
        // .getTracks() that exists on the stream [video, audio] then take stream and attach to the peer object
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current)); 
    }

    /**
     * Make peers agreement on proper connection method
     * @param {ID of call recipient} userID 
     */
    function createPeer(userID) {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                },
                {
                    urls: "turn:numb.viagenie.ca",
                    credential: "muazkh",
                    username: "webrtc@live.com"
                },
            ]
        });

        peer.onicecandidate = handleICECandidateEvent; // when browser wants to find a new candidate
        peer.ontrack = handleTrackEvent; // when remote peer is sending their stream, get and display stream
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID); // handle offer, answer event
        return peer;
    };

    function handleNegotiationNeededEvent(userID) {
        peerRef.current.createOffer().then(offer => { // set local offer, answer & remote offer, answer
            return peerRef.current.setLocalDescription(offer);
        }).then(() => {
            const payload = {
                target: userID,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription // offer data
            };
            socketRef.current.emit("offer", payload);
            console.log("handle negotitation:", errID.current)
            errID.current += 1
        }).catch(e => {
            console.log(e, errID.current)
            errID.current += 1
        });
    }

    /**
     * handle call as a receiver
     * @param { incoming payload } incoming 
     */
    function handleReceiveCall(incoming) {
        peerRef.current = createPeer();
        const desc = new RTCSessionDescription(incoming.sdp); // creates remote description using offer data
        console.log("Incoming SDP:", incoming.sdp);

        peerRef.current.setRemoteDescription(desc).then(() => {
            userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current)); // attaching current user's stream to peer so peer can send to other user
        }).then(() => {
            return peerRef.current.createAnswer();
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit("answer", payload);
        });
    }

    function handleAnswer(message) {
        const desc = new RTCSessionDescription(message.sdp);
        console.log("handle asnwer")
        peerRef.current.setRemoteDescription(desc).catch(e => {
            console.log(e, errID.current)
            errID.current += 1
        });
    }

    /**
     * 
     * @param {*} e 
     */
    function handleICECandidateEvent(e) {
        if (e.candidate) { // needs to have candidate in order to create proceed
            const payload = {
                target: otherUser.current,
                candidate: e.candidate,
            }
            socketRef.current.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);
        console.log("received new ice candidates")
        peerRef.current.addIceCandidate(candidate).catch(e => {
            console.log(e, errID.current)
            errID.current+= 1
        });
    }

    function handleTrackEvent(e) {
        console.log(e.streams[0]);
        partnerVideo.current.srcObject = e.streams[0];
    }

    return (
        <div>
            <video autoPlay ref={userVideo}/>
            <video autoPlay ref={partnerVideo}/>
        </div>
    );
};

export default Room;