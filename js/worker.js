let ports = new Set();
let themed = false;

onconnect = function (event) {
    const port = event.ports[0];

    ports.add(port);
    ports.forEach((p) => {
        p.postMessage({
            type: 'UPDATE_TABS_COUNT',
            value: ports.size,
        });
    });

    if (themed) {
        port.postMessage({
            type: 'TOGGLE_THEME',
        });
    }

    port.onmessage = function (e) {
        let message = {};

        if (e.data === 'unload_tab') {
            ports.delete(port);

            message = {
                type: 'UPDATE_TABS_COUNT',
                value: ports.size,
            };
        }

        if (e.data === 'toggle_theme') {
            themed = !themed;

            message = {
                type: 'TOGGLE_THEME',
            };
        }

        ports.forEach(p => p.postMessage(message));
    };
};
