import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { errorMessage } from "./api";

/** Ekran her açıldığında veriyi yeniden çeker; son başarılı veriyi hata sırasında da tutar. */
export function useLoad<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loaderRef = useRef(loader);
  useLayoutEffect(() => {
    loaderRef.current = loader;
  });

  const load = useCallback(async () => {
    try {
      setData(await loaderRef.current());
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { data, setData, error, setError, refreshing, refresh, reload: load };
}
