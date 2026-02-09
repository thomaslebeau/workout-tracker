import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, spacing } from "../theme";

const CHAMFER_SIZE = 8;

interface SystemCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function SystemCard({ children, style }: SystemCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.chamfer} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    overflow: "hidden",
  },
  chamfer: {
    position: "absolute",
    top: -1,
    left: -1,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: CHAMFER_SIZE,
    borderRightWidth: CHAMFER_SIZE,
    borderTopColor: colors.bgPrimary,
    borderRightColor: "transparent",
    zIndex: 1,
  },
});
