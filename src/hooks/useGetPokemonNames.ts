import { useEffect, useState } from "react";
import { useGetPokemonNamesQuery } from "../app/api";

const useGetPokemonNames = () => {
  const [pokemonNames, setPokemonNames] = useState<
    { name: string; url: string }[]
  >([]);

  const { data: allPokemonNames } = useGetPokemonNamesQuery();

  useEffect(() => {
    setPokemonNames(allPokemonNames?.results ?? []);
  }, [allPokemonNames?.results]);

  const search = (keyword: string) => {
    console.log(keyword);
    if (allPokemonNames?.results)
      setPokemonNames(
        allPokemonNames?.results.filter((names) => names.name.includes(keyword))
      );
  };

  return { pokemonNames, search };
};

export default useGetPokemonNames;
