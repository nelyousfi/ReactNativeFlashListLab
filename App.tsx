import {FlashList} from '@shopify/flash-list';
import React, {ReactNode, useCallback, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  LayoutAnimation,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';

const generateItems = (n: number): Array<number> => {
  return Array.from(Array(n)).map((_, i) => {
    return i;
  });
};

enum ViewTypes {
  GREY = 'grey',
  WHITE = 'white',
}

const {width} = Dimensions.get('window');

const layoutProvider = new LayoutProvider(
  index => (index % 2 ? ViewTypes.GREY : ViewTypes.WHITE),
  (_, dim) => {
    // this part is ignored when forceNonDeterministicRendering is true
    dim.height = 50;
    dim.width = width;
  },
);

let counter = 0;

const CellContainer = ({
  type,
  children,
  onPress,
}: {
  type: 'grey' | 'white';
  children: ReactNode;
  onPress: () => void;
}) => {
  const count = useRef(counter++);

  return (
    <Pressable
      style={{
        flex: 1,
      }}
      onPress={onPress}>
      <View
        style={{
          backgroundColor: type,
        }}>
        <Text>{count.current}</Text>
        {children}
      </View>
    </Pressable>
  );
};

const provider = new DataProvider((r1, r2) => {
  return r1 !== r2;
});

const Recycler = () => {
  const [items, setItems] = useState(generateItems(1000));

  const dataProvider = useMemo(() => {
    return provider.cloneWithRows(items);
  }, [items]);

  const rowRender = useCallback(
    (viewTypes: string | number, data: number) => {
      const onPress = () => {
        setItems(list => list.filter(i => i !== data));
      };

      switch (viewTypes) {
        case ViewTypes.GREY:
          return (
            <CellContainer type="grey" onPress={onPress}>
              <Text>Data: {data}</Text>
            </CellContainer>
          );
        case ViewTypes.WHITE:
          return (
            <CellContainer type="white" onPress={onPress}>
              <Text>Data: {data}</Text>
            </CellContainer>
          );
        default:
          return null;
      }
    },
    [setItems],
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <RecyclerListView
        layoutProvider={layoutProvider}
        dataProvider={dataProvider}
        rowRenderer={rowRender}
        forceNonDeterministicRendering
      />
    </SafeAreaView>
  );
};

const Flash = () => {
  const [data, setData] = useState(generateItems(1000));

  const list = useRef<FlashList<number> | null>(null);

  const removeItem = (item: number) => {
    setData(
      data.filter(dataItem => {
        return dataItem !== item;
      }),
    );
    // This must be called before `LayoutAnimation.configureNext` in order for the animation to run properly.
    list.current?.prepareForLayoutAnimationRender();
    // After removing the item, we can start the animation.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const renderItem = ({item}: {item: number; index: number}) => {
    return (
      <CellContainer
        type={item % 2 ? 'grey' : 'white'}
        onPress={() => {
          removeItem(item);
        }}>
        <Text>Data: {item}</Text>
      </CellContainer>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <FlashList
        // Saving reference to the `FlashList` instance to later trigger `prepareForLayoutAnimationRender` method.
        ref={list}
        // This prop is necessary to uniquely identify the elements in the list.
        keyExtractor={(item: number) => {
          return item.toString();
        }}
        renderItem={renderItem}
        estimatedItemSize={50}
        data={data}
      />
    </SafeAreaView>
  );
};

const Flat = () => {
  const [data, setData] = useState(generateItems(100));

  const removeItem = (item: number) => {
    setData(
      data.filter(dataItem => {
        return dataItem !== item;
      }),
    );
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const renderItem = ({item}: {item: number; index: number}) => {
    return (
      <CellContainer
        type={item % 2 ? 'grey' : 'white'}
        onPress={() => {
          removeItem(item);
        }}>
        <Text>Data: {item}</Text>
      </CellContainer>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <FlatList
        keyExtractor={(item: number) => {
          return item.toString();
        }}
        renderItem={renderItem}
        data={data}
      />
    </SafeAreaView>
  );
};

export default Flat;
