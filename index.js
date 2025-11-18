document.addEventListener('DOMContentLoaded', async () => {
	const response = await fetch('movies.tsv');
	console.assert(response.ok);
	const rows = (await response.text()).split('\n').slice(1, -1).map(line => line.split('	')); // The first line is header. The last row is an empty line.
	const tbody = document.getElementById('tbody');
	rows.forEach(row => {
		const tr = document.createElement('tr');
		row.forEach((col, idx) => {
			const td = document.createElement('td');
			const text = document.createTextNode(col);
			if (idx === 1) {
				const a = document.createElement('a');
				a.setAttribute('href', `https://www.imdb.com/title/${col}/`);
				a.appendChild(text);
				td.appendChild(a);
			} else {
				td.appendChild(text);
			}
			tr.appendChild(td);
		});
		tbody.appendChild(tr);
	});
	tbody.addEventListener('click', (event) => {
		for (const tr of event.currentTarget.children) { // event.currentTarget returns <tbody>. event.currentTarget.children returns a collection of <tr>.
			tr.classList.remove('table-active');
		}
		const tr = event.target.parentNode; // event.target returns <td>. event.target.parentNode returns <tr>.
		tr.classList.add('table-active');
		const directory = `assets/${tr.children[0].innerText} ${tr.children[1].innerText}`; // tr.children returns a collection of <td>.
		document.getElementById('poster').setAttribute('src', `${directory}/poster.jpg`);
		document.getElementById('cast').setAttribute('src', `${directory}/cast.png`);
		document.getElementById('trailer').setAttribute('src', `${directory}/trailer.mp4`);
		document.getElementById('preview').setAttribute('src', `${directory}/preview.jpg`);
	});
	const container = document.getElementById('table-container');
	container.scrollTop = container.scrollHeight; // Auto scroll down the table to the bottom.
});
