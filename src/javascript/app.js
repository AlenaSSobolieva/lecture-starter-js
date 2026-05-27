import createFighters from './components/fightersView';
import { createFightersSelector } from './components/fighterSelector';
import fighterService from './services/fightersService';

class App {
    static rootElement = document.getElementById('root');

    static loadingElement = document.getElementById('loading-backdrop');

    static async startApplication() {
        try {
            App.loadingElement.style.visibility = 'visible';

            const fighters = await fighterService.getFighters();
            const selectFighter = createFightersSelector();

            const fightersElement = createFighters(fighters, selectFighter);

            App.rootElement.appendChild(fightersElement);
        } catch (error) {
            console.warn(error);
            App.rootElement.innerText = 'Failed to load data';
        } finally {
            App.loadingElement.style.visibility = 'hidden';
        }
    }
}

export default App;
