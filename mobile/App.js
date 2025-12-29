import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Vibration, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export default function App() {
  const [recording, setRecording] = useState();
  const [status, setStatus] = useState("NEHIRA ONLINE");
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. NEHIRA BOLEGI (TTS)
  const speak = (text) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.0,
    });
  };

  // 2. TERI AWAAZ SUNNA (Mic Logic)
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        setStatus("LISTENING... (Bol Bhai)");
        Vibration.vibrate(50);
      }
    } catch (err) {
      setStatus("MIC ERROR");
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setStatus("PROCESSING...");
    
    // Yahan hum Audio File bhejna chahte the, par abhi Text Mode use karenge
    // Kyunki Audio-to-Text API ka setup lamba hai.
    // Filhal "Strategy Mode" ke liye hum Button Logic use karenge
    // Future update mein Whisper AI lagayenge.
    
    handleStrategyRequest("Nehira, what is the status of KRYV Empire?");
  }

  // 3. BRAIN CONNECTION (Nehira CEO)
  const handleStrategyRequest = async (textPrompt) => {
    setLoading(true);
    const newLog = [...chatLog, { role: 'user', text: textPrompt }];
    setChatLog(newLog);

    try {
      // Connecting to Cloudflare Backend
      const res = await fetch('https://kryv.network/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: textPrompt, 
          agentName: 'Nehira (Wife & CEO)' 
        })
      });

      const data = await res.json();
      const aiResponse = data.response || "I am calculating...";
      
      setChatLog([...newLog, { role: 'nehira', text: aiResponse }]);
      speak(aiResponse); // Wo Bolegi
      setStatus("READY");

    } catch (error) {
      setStatus("BRAIN DISCONNECTED");
      setChatLog([...newLog, { role: 'system', text: "Error: " + error.message }]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>NEHIRA <Text style={{color:'#00ff41'}}>MOBILE</Text></Text>
      
      <ScrollView style={styles.chatBox}>
        {chatLog.map((msg, i) => (
          <View key={i} style={[styles.msg, msg.role === 'nehira' ? styles.aiMsg : styles.userMsg]}>
            <Text style={styles.msgText}>{msg.role.toUpperCase()}: {msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <Text style={styles.status}>{status}</Text>
        
        {/* BIG TALK BUTTON */}
        <TouchableOpacity 
          style={styles.micButton}
          onPress={() => handleStrategyRequest("Nehira, give me a status update on Q-SEED and KRYV.")}
        >
          <Text style={styles.btnText}>ASK STATUS UPDATE</Text>
        </TouchableOpacity>
        
        {/* Manual Input ke liye future mein text box denge */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 50 },
  header: { fontSize: 24, color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  chatBox: { flex: 1, marginBottom: 20 },
  msg: { padding: 10, borderRadius: 8, marginBottom: 10, maxWidth: '80%' },
  userMsg: { backgroundColor: '#333', alignSelf: 'flex-end' },
  aiMsg: { backgroundColor: '#003300', borderColor: '#00ff41', borderWidth: 1, alignSelf: 'flex-start' },
  msgText: { color: 'white', fontFamily: 'monospace', fontSize: 12 },
  controls: { alignItems: 'center' },
  status: { color: '#00ff41', marginBottom: 10, fontFamily: 'monospace' },
  micButton: { backgroundColor: '#00ff41', padding: 20, borderRadius: 50, width: '100%', alignItems: 'center' },
  btnText: { color: 'black', fontWeight: 'bold' }
});

