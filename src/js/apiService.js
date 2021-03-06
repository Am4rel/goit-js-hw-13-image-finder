
export default async function getImages(searchQuery, page, API_KEY) {
    const BASE_URL = "https://pixabay.com/api/";
    const url = `${BASE_URL}?image_type=photo&orientation=horizontal&q=${searchQuery}&page=${page}&per_page=12&key=${API_KEY}`;

    try {
        const imageList = await fetch(url);
        return await imageList.json();
    } catch (error) {
        console.warn("Ошибка сервиса, пожалуйста, попробуйте сделать запрос позже.")
        return "error"
    }
    
}
