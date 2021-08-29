import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext, useEffect } from 'react';
import { Button, Image, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import withPreventDoubleClick from '../hoc/withPreventDoubleClick';
import { IProduct } from '../interfaces/product';
import { Comparizy } from '../screens/HomeScreen';
import { ProductDetail } from '../screens/ProductDetail';
import { ProductNotificationScreen } from '../screens/ProductNotificationScreen';
import  PictureScreen from "../screens/PictureScreen"


export type StackNavigationProps = {
  Comparizy: Record<string, { url: string }>;
  ProductDetail: Record<string, { product: IProduct, deleteNotification?: boolean }>;
  ProductNotificationScreen: Record<string, { products: IProduct[] }>;
};

const Stack = createStackNavigator();

const ButtonDebounce: any = withPreventDoubleClick(Button)

export const StackNavigation: React.FC<StackNavigationProps> = ({}) => {
  const {authState, signIn, logout, checkIsLoggedIn} = useContext(AuthContext);

  useEffect(() => {
    checkIsLoggedIn(null);
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        title: "Comparizy",
        headerTitleStyle: {
          textAlign: 'center',
          color: 'orange',
          fontWeight: 'bold',
          // marginRight: Platform.OS === 'android' && authState.isLoggedIn ? 10 : 0
        },
        cardStyle: {
          backgroundColor: 'white',
        },
      }}>
      <Stack.Screen
        name="Comparizy"
        options={{
          headerRightContainerStyle: {marginRight: 15},
          headerRight: () =>
            !authState.isLoggedIn ? (
              <ButtonDebounce onPress={signIn} title="Iniciar sesión" color="#0096FF"></ButtonDebounce>
             ) : (<ButtonDebounce onPress={logout} title="Cerrar sesión" color="#0096FF"></ButtonDebounce>),
          headerLeftContainerStyle: {marginLeft: 15},
          headerLeft: () => {
            return authState.userImage ? (
              <Image
                source={{uri: authState.userImage}}
                style={styles.userIcon}
              />
            ) : (
              <Image
                source={require('../images/user.png')}
                style={styles.userIcon}
              />
            );
          },
        }}
        component={Comparizy}
      />

      <Stack.Screen
        name='HomeScreenWithSearch'
        options={{
          headerRightContainerStyle: {marginRight: 15},
          headerRight: () =>
            !authState.isLoggedIn ? (
              <ButtonDebounce onPress={signIn} title="Iniciar sesión" color="#0096FF"></ButtonDebounce>
             ) : (<ButtonDebounce onPress={logout} title="Cerrar sesión" color="#0096FF"></ButtonDebounce>),
          headerLeftContainerStyle: {marginLeft: 15},
          headerLeft: () => {
            return authState.userImage ? (
              <Image
                source={{uri: authState.userImage}}
                style={styles.userIcon}
              />
            ) : (
              <Image
                source={require('../images/user.png')}
                style={styles.userIcon}
              />
            );
          },
        }}
        component={PictureScreen}

      />
      
      <Stack.Screen name='PictureScreen'component={PictureScreen}></Stack.Screen>
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
      <Stack.Screen name="ProductNotificationScreen" component={ProductNotificationScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
