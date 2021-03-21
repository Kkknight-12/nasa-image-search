import { useState, useEffect } from 'react';
import axios from 'axios';

const Search = () => {
    const [ term, setTerm ] = useState('apollo'); 
    const [ debounceTerm, setDebounceTerm ] = useState(term)
    const [ results, setResults ] = useState([])
    const [ suggestion, setSuggestion ] = useState([])
    const [image, setImage] = useState([])

    useEffect( () => {
        const imageOfDay = async() => {
            const { data } = await axios.get(`https://api.nasa.gov/planetary/apod?`,{
                params: {
                    api_key: "USE_YOUR_API_KEY_HERE",
                }
            })
            setImage(data)
        }
        imageOfDay()
    },[term])/*  */

    useEffect( () => {
        const timerId = setTimeout( () => {
            setDebounceTerm(term)
        }, 1000);

        return () => {
            clearTimeout(timerId)
        }
    }, [term] )

    useEffect( () => {
        const search = async () => {
            const { data } = await axios.get(
                `https://images-api.nasa.gov/search?q=${debounceTerm}&media_type=image`);

            if(debounceTerm) {
            setResults(data.collection.items.splice(0,5))
            setSuggestion(data.collection.items[0].data[0].keywords)
            }
        };
        search();
    }, [debounceTerm]);

    const renderedResults = results.map( ( result, index ) => {
        const  href   = result.links[0].href
        let date = result.data[0].date_created
        date = new Date(date).toDateString()
        const title = result.data[0].title

        return(
            <div key={index} className="search-img">
                <img src={href} alt=""/>
                <h2>{title}</h2>
                <h3>{date}</h3>
            </div>
        )
    })

    const nextPage = (page) => {
        const search = async () => {
            const { data } = await axios.get(`https://images-api.nasa.gov/search?q=${debounceTerm}&page=${page}&media_type=image`);
            console.log(data)
            setResults(data.collection.items.splice(0,5))
        };
        search();
    }

    const sug = () => {
        return( 
            <ul className="related-search-ul">
                {
                suggestion.map( (i, index) => (
                    <div key={index} className="related-search-li">
                        <li><a onClick={ ()=> setDebounceTerm(i) } href="#">{i}</a>
                        </li>
                    </div>
                ))}
            </ul>

        )
    }

    return ( 
        <div>
            <div className="">
                <div className="search">
                    <label htmlFor="">Enter Search Term</label>
                    <input className="input"
                    autoFocus
                    value={term}
                    onChange={ (e)=> setTerm( e.target.value ) }/>
                </div>
            </div>
            <div className="image-of-day">
                <h1>{image.title}</h1>
                <img src={image.hdurl} alt=""/>
                <p>{image.explanation}</p>
                <h4>{image.data}</h4>
                <p className="copyright">&copy; {image.copyright}</p>
            </div>
            <div className="ui-list">
                <h2>Search Results for {debounceTerm.toLocaleUpperCase()}</h2>
                {renderedResults}
            </div>
            <div>
                <ul className="paggination" >
                    <li><a onClick={ () => nextPage(1) } href='#'>1</a></li>
                    <li><a onClick={ () => nextPage(2) } href='#'>2</a></li>
                    <li><a onClick={ () => nextPage(3) } href="#">3</a></li>
                    <li><a onClick={ () => nextPage(4) } href="#">4</a></li>
                    <li><a onClick={ () => nextPage(5) } href="#">Next</a></li>
                </ul>
                <div className="related-search">
                    <h2>Related Searches:</h2>
                    <h3 className="keywords">
                        { sug() }
                    </h3>
                </div>
            </div>
        </div>
    );
}

export default Search;