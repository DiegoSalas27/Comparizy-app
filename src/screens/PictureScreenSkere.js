// import React from 'react';
// import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
// import { RNCamera } from 'react-native-camera';
// import PendingView from './PendingView';
// import { useNavigation } from '@react-navigation/native';
//
//
// class PictureScreenSkere extends React.Component{
//
//   navigation = useNavigation();
//
//   state = {
//     pausePreview: false,
//   }
//
//   render(){
//     const {pausePreview} = this.state;
//     return (
//       <View style={styles.container}>
//         <RNCamera
//           style={styles.preview}
//           type={RNCamera.Constants.Type.back}
//           flashMode={RNCamera.Constants.FlashMode.off}
//           androidCameraPermissionOptions={{
//             title: 'Permission to use camera',
//             message: 'We need your permission to use your camera',
//             buttonPositive: 'Ok',
//             buttonNegative: 'Cancel',
//           }}
//           androidRecordAudioPermissionOptions={{
//             title: 'Permission to use audio recording',
//             message: 'We need your permission to use your audio',
//             buttonPositive: 'Ok',
//             buttonNegative: 'Cancel',
//           }}
//         >
//           {({ camera, status, recordAudioPermissionStatus }) => {
//             if (status !== 'READY') return <PendingView />;
//             return (
//               <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
//                 {pausePreview?
//                 <TouchableOpacity style={styles.button}
//                 onPress={() => this.resumePicture(camera)}>
//                   <Text>Aceptar</Text>
//                 </TouchableOpacity>
//                 :null
//                 }
//
//                 <TouchableOpacity onPress={() => this.takePicture(camera)} style={styles.button}>
//                   <Text style={{ fontSize: 14 }}> Tomar otra foto </Text>
//                 </TouchableOpacity>
//
//               </View>
//             );
//           }}
//         </RNCamera>
//       </View>
//     );
//   }
//   takePicture = async function(camera) {
//     const options = { quality: 0.5, base64: true };
//     const data = await camera.takePictureAsync(options);
//     //  eslint-disable-next-line
//
//     navigation.navigate('Comparizy');
//
//     // const source = data.uri;
//     // if (source) {
//     //   await camera.pausePreview();
//     //   console.log("picture source", source);
//     //   this.setState({ pausePreview:true })
//     // }
//   };
//
//   resumePicture = async function(camera){
//     await camera.resumePreview()
//     this.setState({pausePreview:false})
//   }
// }
//
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column',
//     backgroundColor: 'black',
//   },
//   preview: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   button: {
//     flex: 0,
//     backgroundColor: '#fff',
//     borderRadius: 5,
//     padding: 15,
//     paddingHorizontal: 20,
//     alignSelf: 'center',
//     margin: 20,
//   },
// });
//
// export default PictureScreen;
