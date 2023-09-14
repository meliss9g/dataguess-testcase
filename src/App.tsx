import React, { useEffect, useState } from 'react';
import './App.css';
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client";

interface ICountry {
  code: string;
  name: string;
  emoji: string;
  color: string;
}

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://countries.trevorblades.com"
});

const QUERY = gql`
  {
    countries {
      name
      code
      emoji
    }
  }
`;

function App() {
  const [limit, setLimit] = useState<any>(10);
  const [searchWord, setSearchWord] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<ICountry>();
  const [selectedColor, setSelectedColor] = useState<string>();

  useEffect(() => {
    function handleSearch(searchWord:string) {
      searchWord = searchWord.trim();
      if (searchWord.startsWith("search:")) {
        const searchTerm = "search:";
        const searchTermIndex = searchWord.indexOf(searchTerm);
        const searchTermLength = searchTerm.length; // 7
        let searchTermAfter = searchWord.slice(
          searchTermIndex + searchTermLength
        );

        if (searchTermAfter.includes("size:")) {
          const sizeTerm = "size:";
          const sizeTermIndex = searchTermAfter.indexOf(sizeTerm);
          const sizeTermLength = sizeTerm.length; // 7
          let sizeTermAfter = searchTermAfter.slice(
            sizeTermIndex + sizeTermLength
          );

          searchTermAfter = searchTermAfter.slice(0, sizeTermIndex);
          searchTermAfter = searchTermAfter.trim();
          if (sizeTermAfter !== "") setLimit(Number(sizeTermAfter));
          else setLimit(10);
        } else {
          setLimit(10);
        }

        setSearchWord(searchTermAfter);
      } else {
        setSearchWord(searchWord);
      }
    }
    handleSearch(searchWord);
  }, [searchWord]);

  const { data, loading, error } = useQuery<any>(QUERY, {
    client
  });

  if (loading || error) {
    return <p>{error ? error.message : "Loading..."}</p>;
  }
  /*const Countries: ICountry[] = data.countries.forEach((s:ICountry) => {
    console.log("#" + Math.floor(Math.random() * 16777215).toString(16))
  });*/

  const Search = (): ICountry[] => {
    const filtered = data?.countries?.filter((value:any) => {
      return (
        value?.name?.toLowerCase().includes(searchWord?.toLowerCase()) ||
        value?.code?.toLowerCase().includes(searchWord?.toLowerCase())
      );
    });
    return filtered;
  };


  const finalCountries: ICountry[] | [] = searchWord
  ? Search().slice(0, limit)
  :  data?.countries?.slice(0, limit);

  const handleSelectedItem = (country:ICountry, color:string) => {
    setSelectedCountry(country);
    setSelectedColor(color);
  }

  return (
    <div className="App">
      <div style={{textAlign: "left"}}>
      <input
        type="text"
        onChange={(event) => setSearchWord(event.target.value)}
      />
      </div>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {finalCountries?.map((country: ICountry, index:Number) => {
            const color:string = "#" + Math.floor(Math.random() * 16777215).toString(16)
            return (
              <tr key={index.toString()} style={{backgroundColor: selectedCountry?.code === country?.code  ? selectedColor : finalCountries?.length -1 === index && !selectedColor ? color : ''}} className='row' onClick={() => handleSelectedItem(country, color)}>
              <td>{country.code}</td>
              <td>{country.name}</td>
              <td>{country.emoji}</td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
}

export default App;
