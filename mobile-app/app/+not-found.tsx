import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-canvas px-5">
        <Text className="text-xl font-bold text-foreground">This screen does not exist.</Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-base font-semibold text-primary">Go to Home</Text>
        </Link>
      </View>
    </>
  );
}
