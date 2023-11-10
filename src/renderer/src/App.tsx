const App = (): JSX.Element  => {

  window.feather.ping().then((res) => {
    console.log(res); // Should log 'pong'
  });

  window.feather.readFeather("./resources/enge_modified_nocomp.feather").then((res) => {
    console.log(res);
  });


  return (
 
    <div className="container">
     
    </div>
  )
}

export default App
