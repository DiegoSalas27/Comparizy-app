import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from 'rn-range-slider';
import Snackbar from 'react-native-snackbar';
import {GridListProduct} from '../components/GridListProduct';
import {SearchBox} from '../components/SearchBox';
import Label from '../components/Slider/Label';
import Notch from '../components/Slider/Notch';
import Rail from '../components/Slider/Rail';
import RailSelected from '../components/Slider/RailSelected';
import silderStyles from '../components/Slider/silderStyles';
import Thumb from '../components/Slider/Thumb';
import {useFilteredProducts} from '../hooks/useFilteredProducts';
import {useFilteredProductsByCategory} from '../hooks/useFilteredProductsByCategory';
import {useProducts} from '../hooks/useProducts';
import {StackNavigationProps} from '../navigation/StackNavigation';
import {AuthContext} from '../context/AuthContext';
import {validateShowNotificationSnackBar} from '../api/productService';

const screenHeight = Dimensions.get('screen').height;
const screenWidth = Dimensions.get('screen').width;

interface ComparizyProps
  extends StackScreenProps<StackNavigationProps['Comparizy'], 'Comparizy'> {}

export const Comparizy: React.FC<ComparizyProps> = ({route}) => {
  let url: string | undefined;
  url = route.params ? route.params.url : undefined;

  let searchString: string | undefined;
  searchString = route.params ? route.params.prediction : undefined;

  const {products, setProducts, getProducts} = useProducts();
  const [filterValue, setFilteredValue] = useState('');
  const [isHome, setIsHome] = useState(true);
  const [isGrid, setIsGrid] = useState(false);
  const [isGeneric, setGeneric] = useState(false);

  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(20000);
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback(value => <Label text={value} />, []);
  const renderNotch = useCallback(() => <Notch />, []);

  const {authState} = useContext(AuthContext);
  const navigation = useNavigation();

  const {
    loadFilteredProducts,
    setReachedBottom,
    reachedBottom,
    filteredProducts,
    setFilteredProducts,
  } = useFilteredProducts(5);
  const {
    loadFilteredProductsByCategory,
    setReachedBottomCategory,
    reachedBottomCategory,
    filteredProductsCategory,
    setFilteredProductsCategory,
  } = useFilteredProductsByCategory(5);
  const uri =
    'https://img.freepik.com/vector-gratis/diseno-cartel-venta-halloween-oferta-70-descuento_1302-24185.jpg';

  const deleteUrl = () => {
    setGeneric(true);
    setFilteredValue(url!.split('/').pop()!);
  };

  const handleValueChange = useCallback((low, high) => {
    setLow(low);
    setHigh(high);
  }, []);

  const loadMore = async () => {
    if (
      !reachedBottom &&
      filterValue !== '' &&
      filteredProducts.length > 0 &&
      isGeneric
    ) {
      await loadFilteredProducts(filterValue, low, high, true);
    }
    if (
      !reachedBottomCategory &&
      (filterValue !== '' || filteredProductsCategory.length > 0) &&
      !isGeneric
    ) {
      await loadFilteredProductsByCategory(filterValue, url!, low, high, true);
    }
  };

  const filterProducts = async (filterValue: string) => {
    setIsHome(false);
    setReachedBottomCategory(false);
    setReachedBottom(false);
    if (url && !isGeneric) {
      setGeneric(false);
      setFilteredProductsCategory([]);
      setProducts([]);
      await loadFilteredProductsByCategory(filterValue, url, low, high, false);
    } else {
      setGeneric(true);
      setFilteredProducts([]);
      setProducts([]);
      await loadFilteredProducts(filterValue, low, high, false);
    }
    setFilteredValue(filterValue);
  };

  useEffect(() => {
    (async () => {
      if (authState && authState.notificationProducts.length > 0) {
        let products = await validateShowNotificationSnackBar(
          authState.notificationProducts,
        );
        if (products.length > 0) {
          Snackbar &&
            Snackbar.show({
              text: 'Algunos productos han cambiado de precio',
              duration: Snackbar.LENGTH_LONG,
              action: {
                text: 'VER',
                textColor: 'orange',
                onPress: () =>
                  navigation.navigate('ProductNotificationScreen', {products}),
              },
            });
          console.log('There Are Products Wiith Price Changes!!');
        } else {
          console.log('Sad Face');
        }
      }
    })();
  }, [authState]);

  useFocusEffect(
    useCallback(() => {
      setReachedBottom(false);
      setReachedBottomCategory(false);
      setFilteredProductsCategory([]);
      setFilteredProducts([]);
      setFilteredValue('');
      if (url !== undefined) {
        (async () => {
          setIsHome(false);
          setProducts([]);
          setGeneric(false);
          await loadFilteredProductsByCategory('', url!, low, high, false);
        })();
      } else {
        (async () => {
          setIsHome(true);
          setProducts([]);
          await getProducts();
        })();
      }
    }, [url]),
  );

  useEffect(() => {
    if (filteredProducts.length > 0 && isGeneric) {
      setProducts(filteredProducts);
    }
    if (filteredProductsCategory.length > 0 && !isGeneric) {
      setProducts(filteredProductsCategory);
    }
  }, [filteredProducts, filteredProductsCategory]);

  return (
    <>
      <View style={{marginHorizontal: 20}}>
        <SearchBox searchText={searchString} onPress={filterProducts} />
        {(url !== undefined || filterValue !== '') && (
          <>
            {isGeneric ? (
              <Text style={{marginTop: 20}}>
                Busque por nombre, precio, marca o categoría
              </Text>
            ) : (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View style={styles.tag}>
                  <Text style={{paddingLeft: 5}}>{url!.split('/').pop()}</Text>
                  <View style={styles.cross}>
                    <TouchableOpacity onPress={deleteUrl}>
                      <Icon name="close-outline" size={25} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={{marginTop: 20, fontSize: 12}}>
                  Busque por nombre, precio o marca
                </Text>
              </View>
            )}

            <Text style={{marginTop: 20}}>
              Filtrar por precio: S/. {low} - S/. {high}
            </Text>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <Slider
                style={[
                  silderStyles,
                  {marginTop: 20, marginBottom: 20, width: '80%'},
                ]}
                min={0}
                max={20000}
                step={1}
                floatingLabel
                renderThumb={renderThumb}
                renderRail={renderRail}
                renderRailSelected={renderRailSelected}
                renderLabel={renderLabel}
                renderNotch={renderNotch}
                onValueChanged={handleValueChange}
              />
            </View>
            <TouchableOpacity
              style={{alignSelf: 'center'}}
              onPress={() => setIsGrid(grid => !grid)}>
              <Icon
                name="grid-outline"
                size={30}
                color={isGrid ? 'orange' : 'black'}
              />
            </TouchableOpacity>
          </>
        )}
      </View>
      {url == undefined && filterValue == '' && (
        <ScrollView>
          <View style={{marginHorizontal: 20}}>
            <View>
              <View style={styles.imageContainer}>
                <Image source={{uri}} style={styles.posterImage} />
              </View>
              {/* Introduccion  */}
              <View>
                <Text style={styles.mainTextIntro}>Bienvenido a Comparizy</Text>
                <Text style={styles.textIntro}>
                  Somos una aplicación que te ayuda a comparar los precios de
                  todos los Productos que puedas encontrar en los ecommerce a
                  nivel nacional. Te hacemos la vida más fácil ayudándote a
                  ahorrar tiempo y esfuerzo en la búsqueda independiente entre
                  todas las tien das retail.
                </Text>
              </View>
              {/* Caracteristicas  */}
              <View>
                <Text
                  style={[
                    {
                      ...styles.mainTextIntro,
                      fontSize: 14,
                      marginBottom: 30,
                    },
                  ]}>
                  Aquí econtrarás
                </Text>
                <View style={styles.horizontalList}>
                  <View style={styles.horizontalDisplayContainer}>
                    <Image
                      style={styles.horizontalDisplay}
                      source={require('../images/best-price.gif')}
                    />
                    <Text style={{alignSelf: 'center'}}>
                      Mejor precio competitivo
                    </Text>
                  </View>

                  <View style={styles.horizontalDisplayContainer}>
                    <Image
                      style={styles.horizontalDisplay}
                      source={require('../images/historial.jpeg')}
                    />
                    <Text style={{alignSelf: 'center'}}>
                      Historial de precio
                    </Text>
                  </View>
                  <View style={styles.horizontalDisplayContainer}>
                    <Image
                      style={styles.horizontalDisplay}
                      source={require('../images/technology.jpeg')}
                    />
                    <Text style={{alignSelf: 'center'}}>
                      Variedad de productos tecnológicos y electrónicos
                    </Text>
                  </View>
                </View>
              </View>
              {/* Tiendas  */}
              <View>
                <Text
                  style={[
                    {
                      ...styles.mainTextIntro,
                      fontSize: 14,
                      marginTop: 80,
                      marginBottom: 30,
                    },
                  ]}>
                  Tiendas principales
                </Text>
                <View style={styles.horizontalList}>
                  <Image
                    style={styles.horizontalDisplayStore}
                    source={require('../images/ripleyLogo.png')}
                  />
                  <Image
                    style={styles.horizontalDisplayStore}
                    source={require('../images/falabellaLogo.png')}
                  />
                  <Image
                    style={styles.horizontalDisplayStore}
                    source={require('../images/OechsleLogo.jpeg')}
                  />
                </View>
              </View>
              <View>
                <Text
                  style={[
                    {
                      ...styles.mainTextIntro,
                      fontSize: 14,
                      marginTop: 50,
                      marginBottom: 30,
                      alignSelf: 'flex-start',
                    },
                  ]}>
                  Productos de locura
                </Text>
              </View>
            </View>
            {products && products.length > 0 ? (
              <View style={{marginTop: url || filterValue == '' ? 20 : 0}}>
                <GridListProduct
                  isGrid={true}
                  products={products}
                  loadMore={loadMore}
                  reachedBottom={
                    reachedBottom || reachedBottomCategory || isHome
                  }
                />
              </View>
            ) : (reachedBottom || reachedBottomCategory) &&
              products.length == 0 ? (
              <Text>No existen productos que coincidan con la búsqueda</Text>
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
      )}
      {(url !== undefined || filterValue !== '') && (
        <View style={{flex: 1}}>
          {products && products.length > 0 ? (
            <View style={{marginTop: url || filterValue == '' ? 20 : 0}}>
              <GridListProduct
                isGrid={isGrid}
                products={products}
                loadMore={loadMore}
                reachedBottom={reachedBottom || reachedBottomCategory || isHome}
              />
            </View>
          ) : (reachedBottom || reachedBottomCategory) &&
            products.length == 0 ? (
            <Text>No existen productos que coincidan con la búsqueda</Text>
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
      )}
    </>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    marginTop: 10,
    height: screenHeight * 0.3, // 30%
  },
  posterImage: {
    flex: 1,
  },
  mainTextIntro: {
    marginTop: 20,
    fontSize: 16,
    marginBottom: 10,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  textIntro: {
    alignSelf: 'center',
  },
  horizontalList: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  horizontalDisplayContainer: {
    width: screenWidth * 0.25,
    height: screenHeight * 0.15,
    marginHorizontal: 15,
  },
  horizontalDisplay: {
    width: '100%',
    height: '100%',
  },
  horizontalDisplayStore: {
    width: screenWidth * 0.25,
    marginHorizontal: 10,
    aspectRatio: 3 / 1,
  },
  cross: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    top: 0,
    left: screenWidth * 0.35 - 25,
    zIndex: 999,
    elevation: 14,
  },
  tag: {
    marginTop: 10,
    backgroundColor: '#BEBEBE',
    width: screenWidth * 0.35,
    borderRadius: 5,
    padding: 4,
  },
});
