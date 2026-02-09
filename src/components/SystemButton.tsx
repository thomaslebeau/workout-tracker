import React, { useRef } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ViewStyle,
} from "react-native";
import { colors, typography } from "../theme";

type ButtonVariant = "primary" | "destructive" | "ghost";

interface SystemButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
}

export default function SystemButton({
  title,
  onPress,
  variant = "primary",
  style,
}: SystemButtonProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(translateY, {
      toValue: 1,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.base,
            variantStyles[variant],
            pressed && pressedStyles[variant],
            { transform: [{ translateY }] },
            style,
          ]}
        >
          <Text
            style={[
              styles.text,
              textStyles[variant],
              pressed && pressedTextStyles[variant],
            ]}
          >
            {title}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    ...typography.heading,
    fontSize: 16,
    textTransform: "uppercase",
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.accentBlue,
  },
  destructive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.accentRed,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
};

const pressedStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: "#2E4CA3",
  },
  destructive: {
    backgroundColor: colors.accentRed,
  },
  ghost: {
    backgroundColor: colors.bgTertiary,
  },
};

const textStyles: Record<ButtonVariant, object> = {
  primary: { color: colors.bgPrimary },
  destructive: { color: colors.accentRed },
  ghost: { color: colors.textSecondary },
};

const pressedTextStyles: Record<ButtonVariant, object> = {
  primary: { color: colors.bgPrimary },
  destructive: { color: colors.textPrimary },
  ghost: { color: colors.textPrimary },
};
