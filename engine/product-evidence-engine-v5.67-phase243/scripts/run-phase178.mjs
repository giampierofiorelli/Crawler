import {createPhase178Server} from '../dist/src/phase178_site_server.js';
const server=createPhase178Server();
server.listen(0,'127.0.0.1',()=>{
 console.log(`Phase178 LOCAL DEMO: http://127.0.0.1:${server.address().port}/`);
 console.log('No ranking, verified product evidence, authentication or persistence. Press Ctrl+C to stop.');
});
