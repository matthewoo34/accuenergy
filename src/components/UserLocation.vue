<template>
  <b-container id="overallContainer">
    <b-row>
      <b-col id="searchBarColumn">
        <input
          id="searchInput"
          type="text"
          placeholder="Enter your address, and press enter to search"
          v-model="address"
          v-on:keyup.enter="showSearchResult"
          ref="autocomplete"
          @blur="hideSearchResult"
        />
        <font-awesome-icon
          icon="fa-search"
          class="searchBarIcon"
          @click="showSearchResult"
        />
        <font-awesome-icon
          icon="fa-location-crosshairs"
          class="searchBarIcon"
          @click="locatorButtonPressed"
        />
      </b-col>
    </b-row>
    <b-row class="mt-3">
      <b-col lg="12" xl="6">
        <google-map
          :zoom="15"
          map-type-id="terrain"
          id="googleMap"
          :center="
            markers?.length > 0
              ? markers[0].position
              : { lat: 43.653226, lng: -79.3831843 }
          "
        >
          <google-map-marker
            :key="index"
            :position="m.position"
            v-for="(m, index) in markers"
          />
        </google-map>
      </b-col>
      <b-col lg="12" xl="6">
        <div id="tableTopRow">
          <h4 id="tableTitle">Search History</h4>
          <b-button
            variant="danger"
            v-if="showDeleteBtn"
            @click="removeLocation"
            >Delete ({{ this.deleteNum }})</b-button
          >
        </div>
        <b-table
          bordered
          hover
          :items="markers"
          :per-page="perPage"
          :current-page="currentPage"
          id="location-table"
        >
          <template v-slot:cell(selected)="row">
            <b-form-group>
              <b-form-checkbox v-model="row.item.selected"></b-form-checkbox>
            </b-form-group>
          </template>
        </b-table>

        <b-pagination
          v-if="markers.length > 0"
          v-model="currentPage"
          :total-rows="rows"
          :per-page="perPage"
          aria-controls="location-table"
        ></b-pagination>
      </b-col>
    </b-row>
  </b-container>
</template>
<script src="https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyB9R-_5fp3z2zBoNF3S0mkhE__-nJ2O3qM"></script>

<script>
export default {
  data() {
    return {
      address: "",
      markers: [],
      perPage: 10,
      currentPage: 1,
      showDeleteBtn: false,
      deleteNum: 0,
      showSearch: false,
    };
  },
  methods: {
    initGoogleMapApi() {
      //initiate the google map places autocomplete on the autocomplete input,
      let $vm = this;
      var autocomplete = new google.maps.places.Autocomplete(
        this.$refs["autocomplete"]
      );
      autocomplete.addListener("place_changed", function () {
        //add listener to the autocomplete input field for the result
        var place = autocomplete.getPlace();

        if (place.hasOwnProperty("geometry")) {
          // ensure the returned place result has the 'geometry' field to proceed
          let temp = [...$vm.markers];
          var timeZone = $vm.getTimeZone(place); //get the time zone
          temp.unshift({
            selected: false,
            name: place.name,
            position: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
            timeZone: timeZone,
            localTime: $vm.convertTZ(timeZone), //get the local time from the timezone
          });
          console.log($vm.checkNewPlace(place));
          if ($vm.checkNewPlace(place)) {
            $vm.markers = temp;
          }
          $vm.address = ""; //clear the input value
          $vm.showSearch = false; //close the search result after a result is being selected
        }
      });
    },
    locatorButtonPressed() {
      //get the local position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.getStreetAddressFrom(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.log(error.message);
        }
      );
    },

    async getStreetAddressFrom(lat, long) {
      //get the address from the coordinate
      try {
        var { data } = await this.axios.get(
          "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
            lat +
            "," +
            long +
            "&key=AIzaSyB9R-_5fp3z2zBoNF3S0mkhE__-nJ2O3qM"
        );
        if (data.error_message) {
          console.log(data.error_message);
        } else {
          this.$refs["autocomplete"].value = data.results[0].formatted_address; //change the value of the autocomplete to the received address
          this.$refs["autocomplete"].focus();
        }
      } catch (error) {
        console.log(error.message);
      }
    },
    getTimeZone(place) {
      //get time zone from coordinates
      var tzlookup = require("tz-lookup");
      return tzlookup(
        place.geometry.location.lat(),
        place.geometry.location.lng()
      );
    },
    convertTZ(tzString) {
      //convert timezone to local time
      const str = new Date().toLocaleString("en-US", { timeZone: tzString });
      return str;
    },
    showSearchResult() {
      //show the search result
      this.showSearch = true;
      document.getElementsByClassName("pac-container")[0].style.display =
        "block"; //show the result container
      document.getElementsByClassName("pac-container")[0].style.visibility =
        "visible";
    },
    checkNewPlace(place) {
      // compare the last search to current search
      if (place.name === this.markers?.[0]?.name) {
        //if the new search is not a new place compare to the previous search record, it will not add to the markers obj array
        return false;
      }
      return true;
    },
    checkDelete() {
      //check delete item
      //check how many items are selected to be deleted
      var delMarkers = this.markers.filter((marker) => marker.selected);
      if (delMarkers.length > 0) {
        //show the deleteBtn and the num of selected delete item, when delete markers is more than 0
        this.showDeleteBtn = true;
        this.deleteNum = delMarkers.length;
      } else {
        this.showDeleteBtn = false;
      }
    },
    removeLocation() {
      //remove the selected item
      this.markers = this.markers.filter((marker) => !marker.selected);
      this.showDeleteBtn = false;
      this.deleteNum = 0;
    },
    hideSearchResult() {
      //when out focus the search input, it should hide the result, and pending the user to press enter or search to show the search result again
      this.showSearch = false;
      document.getElementsByClassName("pac-container")[0].style.visibility =
        "hidden";
    },
  },
  mounted() {
    this.initGoogleMapApi();
  },
  computed: {
    rows() {
      this.checkDelete();
      return this.markers.length;
    },
  },
  updated() {
    if (!this.showSearch || this.address == "") {
      //hide the search result, when showSearch is false, or the address value is empty string
      this.hideSearchResult();
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#overallContainer {
  padding: 1rem;
}
#searchBarColumn {
  display: flex;
  justify-content: center;
}
#searchInput {
  width: 80%;
  position: "sticky";
}
.searchBarIcon {
  padding: 10px;
}

#tableTopRow {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  align-items: center;
}

#tableTitle {
  margin: 5px;
}

#googleMap {
  width: 100%;
  aspect-ratio: 1/1;
}
</style>
