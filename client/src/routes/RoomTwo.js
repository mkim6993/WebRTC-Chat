import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const Room = (props) => {
    const [cameraToggle, setCameraToggle] = useState(true);
    const [micToggle, setMicToggle] = useState(true);
    const { roomID } = useParams();
    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();
    const socketRef = useRef(io("https://webrtcchatapi.onrender.com"));
    const otherUserSocketID = useRef();
    const userStream = useRef();

    const STUN = {
        iceServers: [
            {
                urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
            }
        ]
    }

    useEffect(() => {
        console.log("useEffect!!!")
        navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        }).then(stream => {
            // set up user's stream
            userVideo.current.srcObject = stream;
            userStream.current = stream;
            userVideo.current.muted = true;
            
            // add user to a room, identify whether someone already is in room
            socketRef.current.emit("join-room", roomID);
            console.log("UseEFFECT: emitting: join-room")

            // prepare to call other user
            socketRef.current.on("other-user", userSocketID => {
                otherUserSocketID.current = userSocketID
                console.log("UseEffect: creating peer and appending my stream")
                createPeerAppendStream(userSocketID);
            });

            // save partner's socketID
            socketRef.current.on("user-joined", userSocketID => {
                console.log("USEEFFECT: saving other person's socketID as otherUserSocketID");
                otherUserSocketID.current = userSocketID
            });

            socketRef.current.on("offer", receiveOffer);

            socketRef.current.on("answer", receiveAnswer);

            socketRef.current.on("ice-candidate", receiveNewIceCandidate);
        });
    }, []);

    /**
     * Create Peer object and add User's stream data to Peer's tracks
     */
    function createPeerAppendStream(userSocketID) {
        peerRef.current = createPeer(userSocketID);
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
        console.log("my stream added")
    }
    
    function createPeer(userSocketID) {
        console.log("my peer being created")
        const peer = new RTCPeerConnection(STUN);

        // on return of ICE Candidates from STUN, send ICE Candidates to other user
        peer.onicecandidate = signalICECandidates;

        // on return of video streams, display call partner's video stream
        peer.ontrack = setUpPartnerStream;

        // set and signal SDP to partner once negotiation is ready to be made
        peer.onnegotiationneeded = () => signalOffer(userSocketID);
        return peer;
    }

    /**
     * if ICE candidate exists signal it to the other user
     */
    function signalICECandidates(event) {
        if (event.candidate) {
            console.log("signalICECandidate(): candidate found")
            const payload = {
                target: otherUserSocketID.current,
                candidate: event.candidate
            }
            socketRef.current.emit("ice-candidate", payload);
            console.log("signalICECandidate(): emitting candidate")
        }
    }

    /**
     * once partner sends stream data, set partner's srcObject
     */
    function setUpPartnerStream(event) {
        partnerVideo.current.srcObject = event.streams[0]
        console.log("setUpParnerStream: partner stream is on");
    }

    /**
     * Create offer and set local SDP, signal offer to target socket
     */
    async function signalOffer(userSocketID) {
        try {
            console.log("signalOffer(): creating offer, setting local desc, emitting offer")
            const offer = await peerRef.current.createOffer();
            await peerRef.current.setLocalDescription(offer);
            const payload = {
                target: userSocketID,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            };
            socketRef.current.emit("offer", payload);
            console.log("signalOffer: offer signaled!!")
        } catch (err) {
            console.log("signalOffer ERROR:");
            console.log(err);
        }
    }

    // recipient

    /**
     * Once ICE Candidates are sent via signaling
     */
    function receiveNewIceCandidate(incoming) {
        console.log("receiveNewIceCandidate(): appending other user's ice candidate to agent")
        const candidate = new RTCIceCandidate(incoming);
        peerRef.current.addIceCandidate(candidate).catch(e => console.log("receiveNewIceCandidate(): ERR", e));
    }

    /**
     * receive offer from caller, set remote desc, create answer, set local desc, send socket and local sdp info
     * @param {*} incoming 
     */
    async function receiveOffer(incoming) {
        try {
            console.log("receiveOffer(): creating my peer, setting remote desc, adding my stream, creating answer, setting local desc")
            peerRef.current = createPeer();
            const sdp = new RTCSessionDescription(incoming.sdp);
            await peerRef.current.setRemoteDescription(sdp);
            userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            const payload = {
                target: incoming.caller,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit("answer", payload)
            console.log("receiveOffer(): emitted answer")
        } catch (error) {
            console.log("RECEIVE OFFER ERROR");
            console.log(error);
        }
    }

    /**
     * receive answer and set remote desc to caller's local sdp
     */
    function receiveAnswer(incoming) {
        console.log("receiveAnswer(): setting my remote desc")
        const sdp = new RTCSessionDescription(incoming.sdp);
        peerRef.current.setRemoteDescription(sdp).catch(e => console.log("receiveAnswer(): ERR", e));
    }
    
    function toggleCamera() {
        const videoTrack = userStream.current.getTracks().find(track => track.kind === "video");
        if (cameraToggle) {
            videoTrack.enabled = false;
            setCameraToggle(false);
        } else {
            videoTrack.enabled = true;
            setCameraToggle(true);
        }
    }

    function toggleMic() {
        const micTrack = userStream.current.getTracks().find(track => track.kind === "audio");
        if (micToggle) {
            micTrack.enabled = false;
            setMicToggle(false);
        } else {
            micTrack.enabled = true;
            setMicToggle(true);
        }
    }

    return (
        <div>
            <video autoPlay ref={userVideo}/>
            <button onClick={() => toggleCamera()}>{cameraToggle ? "Camera is on" : "Camera is off"}</button>
            <button onClick={() => toggleMic()}>{micToggle ? "Mic is on" : "Mic is off"}</button>
            <video autoPlay ref={partnerVideo}/>
        </div>
    );
};

export default Room;