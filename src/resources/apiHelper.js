import axios from "axios";

export const getPokemons = async () => {
  const data = await axios
    .get(`https://pokeapi.co/api/v2/pokemon?limit=400&offset=0`)
    .then((res) => res.data);

  const promises = data.results.map((result) => axios.get(result.url));

  const resolvedData = await Promise.all(promises).then((res) =>
    res.map((pokemon) => pokemon.data)
  );

  //   return resolvedData;

  return new Promise((resolve) => {
    setTimeout(() => resolve(resolvedData), 1000);
  });
};

export const getPokemon = async (id) => {
  const data = await axios
    .get(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then((res) => res.data);

  return data;
};

export const getPokemonSpecies = async (id) => {
  const data = await axios
    .get(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
    .then((res) => res.data);

  return data;
};

export const getAllEvolutions = async (chain) => {
  const initial = getPokemon(chain?.species?.name);
  const evolutions = [];

  const evos = [initial];

  // eslint-disable-next-line array-callback-return
  chain.evolves_to.map((evolution) => {
    const firstEvolution = getPokemon(evolution.species.name);
    evos.push(firstEvolution);

    if (evolution.evolves_to?.length) {
      for (const secondEvolution of evolution.evolves_to) {
        const second = getPokemon(secondEvolution.species.name);
        evos.push(second);
      }
    }
  });

  const resolved = await Promise.all(evos);

  // eslint-disable-next-line array-callback-return
  chain.evolves_to.map((evolution) => {
    const initialEvolution = resolved.find(
      (pokemon) => pokemon.name === chain?.species?.name
    );
    const firstEvolution = resolved.find(
      (pokemon) => pokemon.name === evolution.species.name
    );
    const evolutionLine = [initialEvolution, firstEvolution];

    if (evolution.evolves_to.length) {
      for (const secondEvolution of evolution.evolves_to) {
        const second = resolved.find(
          (pokemon) => pokemon.name === secondEvolution.species.name
        );
        evolutions.push([...evolutionLine, second]);
      }
    } else {
      evolutions.push(evolutionLine);
    }
  });

  return evolutions;
};
