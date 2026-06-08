import { useState, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from './src/screens/SplashScreen';
import { HomeScreen, type HomeTab } from './src/screens/HomeScreen';
import { savePurchase } from './src/lib/api';
import { MovieDetailScreen } from './src/screens/MovieDetailScreen';
import { ShowtimesScreen } from './src/screens/ShowtimesScreen';
import { SeatSelectionScreen } from './src/screens/SeatSelectionScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { PaymentProcessingScreen } from './src/screens/PaymentProcessingScreen';
import { PurchaseSuccessScreen } from './src/screens/PurchaseSuccessScreen';
import {
  StripePaymentScreen,
  type PaymentCustomer,
} from './src/screens/StripePaymentScreen';
import type { SelectedSession } from './src/data/showtimes';
import type { CheckoutOrder } from './src/data/checkout';

type Screen =
  | 'list'
  | 'detail'
  | 'showtimes'
  | 'seats'
  | 'checkout'
  | 'payment'
  | 'processing'
  | 'success';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [itemId, setItemId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('list');
  const [session, setSession] = useState<SelectedSession | null>(null);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [customer, setCustomer] = useState<PaymentCustomer | null>(null);
  const [homeTab, setHomeTab] = useState<HomeTab>('cinema');
  const [ticketsRefreshKey, setTicketsRefreshKey] = useState(0);

  const resetToHome = useCallback((tab: HomeTab = 'cinema') => {
    setHomeTab(tab);
    setItemId(null);
    setScreen('list');
    setSession(null);
    setOrder(null);
    setCustomer(null);
    if (tab === 'tickets') setTicketsRefreshKey((k) => k + 1);
  }, []);

  const handlePaymentComplete = useCallback(async () => {
    if (order) {
      await savePurchase(order);
      setTicketsRefreshKey((k) => k + 1);
    }
    setScreen('success');
  }, [order]);

  const goBack = () => {
    if (screen === 'success') resetToHome();
    else if (screen === 'processing') setScreen('payment');
    else if (screen === 'payment') setScreen('checkout');
    else if (screen === 'checkout') setScreen('seats');
    else if (screen === 'seats') setScreen('showtimes');
    else if (screen === 'showtimes') setScreen('detail');
    else if (screen === 'detail') {
      setItemId(null);
      setScreen('list');
      setSession(null);
      setOrder(null);
      setCustomer(null);
    }
  };

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  if (screen === 'success') {
    return (
      <SafeAreaProvider>
        <PurchaseSuccessScreen
          onBack={() => resetToHome('cinema')}
          onTickets={() => resetToHome('tickets')}
          email={customer?.email}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'processing') {
    return (
      <SafeAreaProvider>
        <PaymentProcessingScreen onComplete={handlePaymentComplete} />
      </SafeAreaProvider>
    );
  }

  if (itemId && screen === 'payment' && order && customer) {
    return (
      <SafeAreaProvider>
        <StripePaymentScreen
          order={order}
          customer={customer}
          onBack={goBack}
          onPay={() => setScreen('processing')}
        />
      </SafeAreaProvider>
    );
  }

  if (itemId && screen === 'checkout' && order) {
    return (
      <SafeAreaProvider>
        <CheckoutScreen
          order={order}
          onBack={goBack}
          onPay={(details) => {
            setCustomer({ name: details.name, email: details.email });
            setScreen('payment');
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (itemId && screen === 'seats' && session) {
    return (
      <SafeAreaProvider>
        <SeatSelectionScreen
          itemId={itemId}
          session={session}
          onBack={goBack}
          onCheckout={(o) => {
            setOrder(o);
            setScreen('checkout');
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (itemId && screen === 'showtimes') {
    return (
      <SafeAreaProvider>
        <ShowtimesScreen
          itemId={itemId}
          onBack={goBack}
          onSessionSelect={(s) => {
            setSession(s);
            setScreen('seats');
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (itemId && screen === 'detail') {
    return (
      <SafeAreaProvider>
        <MovieDetailScreen
          itemId={itemId}
          onBack={goBack}
          onShowtimes={() => setScreen('showtimes')}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <HomeScreen
        initialTab={homeTab}
        ticketsRefreshKey={ticketsRefreshKey}
        onItemPress={(id) => {
          setItemId(id);
          setScreen('detail');
        }}
      />
    </SafeAreaProvider>
  );
}
