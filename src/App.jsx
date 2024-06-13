import React, { useState, useEffect } from 'react';
import './App.css'
import dayjs from 'dayjs';
export default function App() {

	const [globalArray, setGlobalArray] = useState(null);
	const [myKey, setMyKey] = useState(() => {
		// getting stored value
		const saved = localStorage.getItem("myKey");
		const initialValue = JSON.parse(saved);
		return initialValue || "";
	});
	
	const today = dayjs();
	
	
	useEffect(() => {
		localStorage.setItem("myKey", JSON.stringify(myKey));
	}, [myKey]);
	

	
	
	
	async function fetchData(e) {
		e.preventDefault();
		
		let pass = myKey;
		
		if (pass !== '') {
			const url = 'https://club-k9.gingrapp.com/api/v1/reservations?key=' + pass;
			
			const dayFormatted = today.format('YYYY-MM-DD');
			const dayPlusOneFormatted = today.add(1, 'day').format('YYYY-MM-DD');
			const payload = `start_date=${dayFormatted}&end_date=${dayPlusOneFormatted}`;
			const initStuff = {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: payload
			};
			try {
				const response = await fetch(url, initStuff);
				const newData = await response.json();
				
				let modifiedArray = createArrayData(newData.data);
				
				setGlobalArray(modifiedArray);
				
			}
			catch (error) {
				alert("invalid key");
			}
		}
		
	};
	
  function sortByDate(itemA, itemB) {
		if (itemA.end.isAfter(itemB.end))  
			return 1;
		if (itemA.end.isBefore(itemB.end))
			return -1;
		return 0;
			
	}


	function createArrayData(results) {
		let returnObjects = Object.entries(results).map(reservation => (
		{
			dog_name: reservation[1].animal.name.trim(),
			dog_breed: reservation[1].animal.breed.trim(),
			owner_last: reservation[1].owner.last_name.trim(),
			start: dayjs(reservation[1].start_date),
			end: dayjs(reservation[1].end_date),
			type: reservation[1].reservation_type.type,
			canceled: reservation[1].cancelled_date === null ? false : true,
      hasCheckedIn: reservation[1].check_in_date === null ? false : true,
			hasCheckedOut: reservation[1].check_out_date === null ? false : true
		}
		)).filter(res => ( !res.canceled && !res.hasCheckedOut && !res.type.includes("Tour")));
		
    returnObjects.sort(sortByDate);

    returnObjects = returnObjects.map(dogRes => {
      let newEnd = "";
			if(dogRes.end.isSame(today, "day")) {
        newEnd = dogRes.end.format('h:mm a');
			}
			else if(dogRes.end.isSame(today.add(1, 'day'), "day")) {
        newEnd = "Tomorrow";
			}
      else {
        newEnd = dogRes.end.format('MMM D');
      }
      dogRes = {...dogRes, end: newEnd };

      
      if(dogRes.dog_name.includes(dogRes.owner_last)){
        // dogRes.dog_name.substring(0, dogRes.dog_name.index(dogRes.owner_last)-1).trim();
        
        //let correctedDogName = ;
        //console.log(correctedDogName);
        dogRes = {...dogRes, dog_name: dogRes.dog_name.replace(dogRes.owner_last, "").trim()};
      }

			return dogRes;
		});



		return returnObjects;
	}
	

	return (
	<>

			{globalArray ? (
				<table>
          <caption></caption>
					<thead>
					<tr>
            <th colspan="7"><h1 className="date">{today.format("dddd, MMM D")}</h1></th>
          </tr>
          <tr>
						<th className="checkbox">In for nap</th>
						<th className="checkbox">Out from nap</th>
						<th className="checkbox">Picked Up</th>
						<th className="inTime">ETA</th>
						<th className="name">Dog name</th>
						<th className="breed">Breed</th>
						<th className="outTime">Leaving</th>
					</tr>
					</thead>
					<tbody>
					{globalArray.map((data, index) => (
						
						<tr key={index}>
							<td className="checkbox">{data.type.includes("Only") ? "N/A" : ""}</td>
							<td className="checkbox">{data.type.includes("Only") ? "N/A" : ""}</td>
							<td className="checkbox">{data.end.includes(":") ? "" : "N/A"}</td>
							<td className="inTime">{!data.hasCheckedIn ? data.start.format("hh:mm") : "Here"} </td>
							<td className="name">{data.dog_name + " " + data.owner_last}{data.type.includes("Eval") ? " (Eval)" : ""}</td>
							<td className="breed">{data.dog_breed}</td>
							<td className="outTime">{data.end}</td>
						</tr>
					))}
					</tbody>
				</table>
				)
				: 
            <form>
            <div className="error">Enter API key:    
                <input type="text" placeholder="API key" value={myKey} onChange={(e) => setMyKey(e.target.value)} aria-label="apikey" />
            </div>
					  <input type="submit" value="Get list" onClick={fetchData} className="test"></input>
			      </form>
         
			}		
		</>
		);
}


		