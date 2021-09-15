import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import {
  loadSameModelOtherStores,
  verifyProductIsFavorite,
  verityProductIsNotified,
} from '../api/productService';
import {ScrollList} from '../components/ScrollList';
import {PriceHistory} from '../components/PriceHistory';
import {SameProductDiferentStore} from '../components/SameProductDiferentStore';
import {AuthContext} from '../context/AuthContext';
import {useRelatedProducts} from '../hooks/useRelatedProducts';
import {IProduct} from '../interfaces/product';
import {StackNavigationProps} from '../navigation/StackNavigation';
import {useFocusEffect} from '@react-navigation/native';
import withPreventDoubleClick from '../hoc/withPreventDoubleClick';
import {NotLoggedInModal} from '../components/NotLoggedInModal';
import {ProductItem} from '../components/ProductItem';

const ButtonDebounce: any = withPreventDoubleClick(TouchableOpacity);
const fs = RNFetchBlob.fs;
interface ProductDetailProps
  extends StackScreenProps<StackNavigationProps['ProductDetail'], 'ProductDetail'> {}

export const ProductDetail: React.FC<ProductDetailProps> = ({
                                                              navigation,
                                                              route,
                                                            }) => {
  const product = route.params.product;
  const deleteNotification = route.params.deleteNotification;
  const [compareProducts, setCompareProducts] = useState<IProduct[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [productIsFavorite, setProductIsFavorite] = useState(false);
  const [productIsNotified, setProductIsNotified] = useState(false);
  const [showConfirmLogin, setShowConfirmLogin] = useState(false);
  const [confirmLoginText, setConfirmLoginText] = useState('');
  const {
    loadRelatedProducts,
    setReachedBottom,
    reachedBottom,
    relatedProducts,
  } = useRelatedProducts(product, 6); // pasar probablemente a servicio
  const {authState, changeFavoriteProduct, changeNotificaionProduct, deleteNotificationProduct, addVisitedProduct, signIn} =
    useContext(AuthContext);

  useFocusEffect(
    useCallback(() => {
      console.log('focus', product.product_name);
      deleteNotification && (async () => {
        await deleteNotificationProduct(product)
      })();
      initializeComponent();
    }, [product]),
  );

  const loadMore = () => {
    if (!reachedBottom) {
      loadRelatedProducts(true);
    }
  };

  const initializeComponent = async () => {
    setReachedBottom(false);
    setIsLoading(true);
    authState.isLoggedIn && (await addVisitedProduct(product));
    let resp = await loadSameModelOtherStores(product);
    setCompareProducts(resp);
    setProductIsFavorite(await verifyProductIsFavorite(authState, product));
    !deleteNotification && setProductIsNotified(await verityProductIsNotified(authState, product));
    setIsLoading(false);
  };

  const validatePressFav = async () => {
    if (authState.isLoggedIn) {
      await changeFavoriteProduct(product);
      setProductIsFavorite(!productIsFavorite);
    } else {
      setConfirmLoginText(
        'Necesitas iniciar sesión para activar la opción "Favoritos"',
      );
      setShowConfirmLogin(true);
    }
  };

  const validatePressNotification = async () => {
    if (authState.isLoggedIn) {
      await changeNotificaionProduct(product);
      setProductIsNotified(!productIsNotified);
    } else {
      setConfirmLoginText(
        'Necesitas iniciar sesión para activar la opción "Notificación"',
      );
      setShowConfirmLogin(true);
    }
  };

  const closeModal = () => {
    setShowConfirmLogin(false);
  };

  const showLoginModal = () => {
    return (
      <NotLoggedInModal
        isVisible={showConfirmLogin}
        backdropOpacity={0.5}
        closeModal={closeModal}
        performAction={() => signIn(closeModal)}
        titleText="No has iniciado sesión"
        bodyText={confirmLoginText}
      />
    );
  };

  const createMessage = () => {
    const tiendaPrecio = compareProducts?.map(ps => {
      const obj = {
        tienda:
          ps.store === 'OE'
            ? 'Oeschle'
            : ps.store === 'RI'
              ? 'Ripley'
              : 'Saga Falabella',
        precio: ps.product_price,
        enlace: ps.product_detail,
      };

      return obj;
    });

    let mensaje = '';
    tiendaPrecio?.map(tp => {
      mensaje += `Precio en ${tp.tienda}: ${tp.precio} \nEnlace: ${tp.enlace} \n\n`;
    });

    return product.product_name + ' \n\n' + mensaje;
  };

  const shareProduct = async (app: string) => {
    let imagePath: any = null;
    let image = '';
    RNFetchBlob.config({
      fileCache: true,
    })
      .fetch('GET', `${product.product_image}`)
      // the image is now dowloaded to device's storage
      .then(resp => {
        // the image path you can use it directly with Image component
        imagePath = resp.path();
        return resp.readFile('base64');
      })
      .then(async base64Data => {
        // here's base64 encoded image
        // console.log('DATA', base64Data);
        image = `data:image/png;base64,${base64Data}`;
        const shareOptions: any = {
          title: 'Comparizy',
          subject: 'Comparizy',
          message: createMessage(),
          url: image,
          social:
            app === 'whatsapp' ? Share.Social.WHATSAPP : Share.Social.TWITTER,
        };

        try {
          const ShareResponse = await Share.shareSingle(shareOptions);
          console.log(JSON.stringify(ShareResponse));
        } catch (err) {
          console.log('Error en share', err);
        }

        // remove the file from storage
        return fs.unlink(imagePath);
      });
  };

  return (
    <ScrollView style={{marginHorizontal: 10, flex: 1}}>
      {showLoginModal()}
      <View style={styles.imageContainer}>
        <Image
          source={{uri: product.product_image}}
          style={styles.productImage}
        />
        <Text style={{fontWeight: 'bold'}}>{product.product_name}</Text>
      </View>
      <View
        style={{
          marginTop: 25,
          flexDirection: 'row',
        }}>
        <TouchableOpacity onPress={async () => await shareProduct('twitter')}>
          <Image
            source={require('../images/twitterLogo.png')}
            style={styles.iconsStyle}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => await shareProduct('whatsapp')}>
          <Image
            source={require('../images/whatsappLogo.png')}
            style={styles.iconsStyle}
          />
        </TouchableOpacity>
        <ButtonDebounce
          style={{marginLeft: 10}}
          onPress={async () => {
            await validatePressFav();
          }}>
          {!productIsFavorite ? (
            <Icon name="heart-outline" style={{color: 'black'}} size={30} />
          ) : (
            <Icon name="heart" style={{color: 'red'}} size={30} />
          )}
        </ButtonDebounce>

        <ButtonDebounce
          style={{marginLeft: 10}}
          onPress={async () => {
            await validatePressNotification();
          }}>
          {!productIsNotified ?(
            <Icon name="notifications-outline" style={{color: 'black'}} size={30} />
          ) : (
            <Icon name="notifications" style={{color: '#FFC300'}} size={30} />
          )}

        </ButtonDebounce>
      </View>

      <View style={styles.relatedProductsContainer}>
        <Text style={{flex: 1, fontWeight: 'bold'}}>Tienda</Text>
        <Text style={{flex: 3, fontWeight: 'bold'}}>Producto</Text>
        <Text style={{fontWeight: 'bold'}}>Online</Text>
      </View>

      {!isLoading ? (
        compareProducts!.map((item, index) => (
          <SameProductDiferentStore
            key={item.model_store_unique_identifier + index}
            item={item}
          />
        ))
      ) : (
        <View
          style={{
            flex: 1,
            height: 80,
            justifyContent: 'center',
            alignContent: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#C6C6C6',
          }}>
          <ActivityIndicator style={{flex: 1}} color="red" size={100} />
        </View>
      )}

      <Text style={{marginLeft: 5, marginTop: 25, fontWeight: '500'}}>
        Historial de precios:
      </Text>
      <View style={{marginTop: 15}}>
        <PriceHistory priceHistory={product.price_history} />
      </View>

      <Text style={{marginLeft: 5, marginTop: 25, fontWeight: '500'}}>
        Productos relacionados:
      </Text>
      <View style={{marginTop: 15}}>
        {relatedProducts ? (
          <ScrollList
            products={relatedProducts}
            loadMore={loadMore}
            reachedBottom={reachedBottom}
            horizontal={true}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <ActivityIndicator color="red" size={100} />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
  },
  productImage: {
    width: 200,
    height: 200,
  },
  iconsStyle: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
    marginRight: 8,
  },
  relatedProductsContainer: {
    marginTop: 15,
    flexDirection: 'row',
    marginHorizontal: 5,
    borderBottomWidth: 1,
    paddingBottom: 10,
    borderColor: '#C6C6C6',
  },
});
