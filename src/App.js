import React, {
  useEffect,
  useRef,
  useState
} from "react"


const configuration = {
  iceServers: [{
    url: "stun:stun.l.google.com:19302"
  }]
}


const App = () => {
  const [input, setinput] = useState("")
  const [pc, setpc] = useState(false)
  const localVideoref = useRef()
  const remoteVideoref = useRef()


  useEffect(() => {
    if (!pc) setpc(new RTCPeerConnection(configuration))


    if (pc) {
      pc.onicecandidate = e =>
        e.candidate &&
        console.log("listen candidate: ", JSON.stringify(e.candidate))


      pc.oniceconnectionstatechange = e => {
        console.log("STATE IS CHANGING", e)
      }


      pc.onaddstream = e => {
        remoteVideoref.current.srcObject = e.stream
      }


      navigator.mediaDevices
        .getUserMedia({
          video: true
        })
        .then(stream => {
          window.localStream = stream
          localVideoref.current.srcObject = stream
          pc.addStream(stream)
        })
        .catch(e => console.log(e))
    }
  }, [pc])


  const _createOffer = () =>
    pc &&
    pc
    .createOffer({
      offerToReceiveVideo: 1
    })
    .then(
      sdp => {
        console.log(JSON.stringify(sdp))
        pc.setLocalDescription(sdp)
      },
      e => {}
    )


  const _setRemoteDescription = () => {
    const desc = JSON.parse(input)
    pc && pc.setRemoteDescription(new RTCSessionDescription(desc))
  }


  const _createAnswer = () =>
    pc &&
    pc
    .createAnswer({
      offerToReceiveVideo: 1
    })
    .then(
      sdp => {
        console.log(JSON.stringify(sdp))
        pc.setLocalDescription(sdp)
      },
      e => {}
    )
  const _addCandidate = () => {
    const candidate = JSON.parse(input)
    console.log("Adding candidate: ", candidate)
    pc && pc.addIceCandidate(new RTCIceCandidate(candidate))
  }


  return ( <div >
    <h1> App 2 </h1>
    <video
      style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black"
        }}
      ref = { localVideoref }
      autoPlay
    >
    </video>
    <video
      style={{
        width: 240,
        height: 240,
        margin: 5,
        backgroundColor: "black"
      }}
      ref = { remoteVideoref }
      autoPlay
    >
    </video>
    <br />
    <button onClick={_createOffer} > offer </button>
    <button onClick = { _createAnswer } > answer </button>

    <br />
    <textarea style={{
        width: 300,
        height: 400
      }}
      onChange = {
        e => setinput(e.target.value)
      }
    />
    <br />
    <button onClick = { _setRemoteDescription }>set remote desc</button>
    <button onClick = { _addCandidate }> add candidate </button>
    </div>
  )
}


export default App