<template>
  <b-container id="overallContainer">
    <b-row>
      <b-col id="searchBarColumn">
        <input
          id="searchInput"
          type="text"
          placeholder="Enter your address, and press enter to search"
          v-model="address"
          v-on:keyup.enter="searchLocation"
          ref="autocomplete"
          @blur="outfocusHandling"
        />
        <font-awesome-icon
          icon="fa-search"
          class="searchBarIcon"
          @click="searchLocation"
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
          style="width: 100%; aspect-ratio: 1/1"
          :center="
            markers?.length > 0
              ? markers[0].position
              : { lat: 51.093048, lng: 6.84212 }
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
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            align-items: center;
          "
        >
          <h4 style="margin: 5px">Search History</h4>
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
  name: "HelloWorld",

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
    locatorButtonPressed() {
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
          this.address = data.results[0].formatted_address;
          this.$refs["autocomplete"].value = data.results[0].formatted_address;
          this.$refs["autocomplete"].focus();
        }
      } catch (error) {
        console.log(error.message);
      }
    },
    getTimeZone(place) {
      var tzlookup = require("tz-lookup");
      return tzlookup(
        place.geometry.location.lat(),
        place.geometry.location.lng()
      );
    },
    convertTZ(tzString) {
      const str = new Date().toLocaleString("en-US", { timeZone: tzString });
      return str;
    },
    searchLocation() {
      this.showSearch = true;
      document.getElementsByClassName("pac-container")[0].style.display =
        "block";
      document.getElementsByClassName("pac-container")[0].style.visibility =
        "visible";
    },
    uniquePlace() {
      return [...new Set(this.markers.map((item) => item.name))]; // [ 'A', 'B']
    },
    checkDelete() {
      var delMarkers = this.markers.filter((marker) => marker.selected);
      if (delMarkers.length > 0) {
        this.showDeleteBtn = true;
        this.deleteNum = delMarkers.length;
      } else {
        this.showDeleteBtn = false;
      }
    },
    removeLocation() {
      this.markers = this.markers.filter((marker) => !marker.selected);
    },
    outfocusHandling() {
      this.showSearch = false;
      document.getElementsByClassName("pac-container")[0].style.visibility =
        "hidden";
    },
  },
  mounted() {
    let $vm = this;
    var autocomplete = new google.maps.places.Autocomplete(
      this.$refs["autocomplete"]
    );
    autocomplete.addListener("place_changed", function () {
      var place = autocomplete.getPlace();
      console.log(place);

      if (place.hasOwnProperty("geometry")) {
        let temp = $vm.markers;
        console.log(temp);

        var timeZone = $vm.getTimeZone(place);

        temp.unshift({
          selected: false,
          name: place.name,
          position: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          },
          timeZone: timeZone,
          localTime: $vm.convertTZ(timeZone),
        });
        console.log(temp);
        $vm.markers = [...new Set(temp)];
        $vm.address = "";
        $vm.showSearch = false;
      }
    });
  },
  computed: {
    rows() {
      this.checkDelete();
      return this.markers.length;
    },
  },
  updated() {
    if (!this.showSearch || this.address == "") {
      this.showSearch = false;
      document.getElementsByClassName("pac-container")[0].style.visibility =
        "hidden";
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

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
