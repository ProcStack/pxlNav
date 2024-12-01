/*
Update - Nov 19th 2024
Jeez.... all this cause I wanted to have the files packing easier with the webpack process
I'll need to revisit this

// -- Script Usage --
Animate points based on a array style animation to opengl
It only updated the uniform's array once a second, since this is a countdown timer,
But means there is room for a better uniform animation system using textures instead of arrays
.... It is easier tho ...

// Why?
It's easy for me to animate stuff in Houdini and export it directly to Javascript.
So heck with it

*/

/*
    attribute float pscale;
    attribute vec3 P;
    attribute float Alpha;
    attribute vec3 N;
*/
export const countDownShapeData={
    "vertCount":500,
    "vertScale":6.0,
    "attrList":[ "pscale", "P", "Alpha", "N" ],
    "attrData":{
        "pscale":{ "size":1, "type":"Float" },
        "P":{ "size":3, "type":"Float" },
        "Alpha":{ "size":1, "type":"Float" },
        "N":{ "size":3, "type":"Float" },
    },
    "defaultData":{
        "pscale":1.0,
        "Alpha":1.0,
    },
    "shapeOrder":[ "countDown_PreFloor" ],
    "shapeTimes":[60.0],
    "shapeTween":[30.0],
    "shapeWorldSpace":[1],
    "shapeData":{
        "countDown_PreFloor":{
            "pscale":[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            "P":[-150.3869,0.0309,890.1465, -117.8755,0.0309,1552.385, 187.3372,0.0309,-834.4932, 2.6271,0.0309,-890.1396, -64.8474,0.0309,1119.1666, 219.9399,0.0309,-642.9562, 103.9793,0.0,1506.4083, -100.6423,0.0309,1032.0382, -24.8593,0.0266,-1026.824, 334.2753,0.0309,-1202.2144, 46.6012,0.0,622.6015, -121.1346,0.0219,-1472.9763, -71.6255,0.0242,-1203.8156, 42.7115,0.0,760.5775, 175.2258,0.0309,-876.5144, 157.5252,0.0309,-708.9138, 73.9312,0.0,495.1274, 164.7533,0.0309,-419.2888, -68.6671,0.0309,646.5574, 25.5656,0.0,197.7138, -125.4273,0.0309,846.3688, 97.3119,0.0,936.7732, -51.6334,0.0241,-1185.2942, 67.3954,0.0309,-118.0236, 117.6981,0.0309,-375.0154, 94.6624,0.0,1186.8494, -92.2881,0.0309,574.7449, 70.9726,0.0309,-352.2303, -175.8378,0.0309,1562.4572, 74.1973,0.0309,-252.7512, -100.1525,0.0309,1230.1896, 143.5322,0.0309,-452.264, 174.0783,0.0,1549.1509, 142.7963,0.0,1256.3729, -31.4469,0.0309,-570.3293, 45.0771,0.0,1508.5973, 30.3038,0.0,1360.8257, 123.1969,0.0309,-507.7389, 294.5794,0.0309,-1253.3958, -138.1551,0.0309,1012.6093, 190.1462,0.0,1469.9302, 87.6287,0.0309,-508.7763, 156.013,0.0309,-1136.9225, 150.2766,0.0309,-984.3299, -66.1524,0.0309,609.4693, -38.4923,0.0278,-981.1913, -111.076,0.0261,-1154.9891, 140.5897,0.0309,-650.5292, 10.0006,0.0,3.3889, -106.8594,0.0309,1340.4265, -119.3344,0.0309,716.591, -165.8946,0.0309,1070.6136, -145.2523,0.0309,1320.1647, -159.4756,0.0309,817.1453, -23.5942,0.0309,-308.5429, 62.1281,0.0,196.7569, -108.4185,0.0309,808.8605, 101.1831,0.0309,-643.9623, 218.2582,0.0309,-1230.3727, -70.2445,0.0309,-60.5595, -125.6638,0.0254,-1208.5692, 186.6017,0.0309,-1243.7875, 265.1731,0.0309,-1261.548, 58.2226,0.0,1196.3478, -263.2238,0.0309,1377.3735, -81.5803,0.0309,877.7581, -136.1593,0.0309,1125.2941, 143.356,0.0,1191.9391, 166.1988,0.0,1402.0992, -2.4629,0.0309,331.3165, 66.9711,0.0,1078.8873, -37.4822,0.0309,-639.3065, 87.9313,0.0,28.6709, -81.6782,0.0309,682.7052, -34.0084,0.0309,378.8786, -109.3853,0.0309,1645.7819, 206.6525,0.0,1442.5007, 280.8166,0.0309,-1278.9175, -65.6157,0.0309,1081.2173, 77.8108,0.0,120.7013, 102.1321,0.0,1065.472, 176.2104,0.0309,-1009.6346, -29.0283,0.0203,-1355.4817, -159.9718,0.0309,1356.9832, -208.7909,0.0309,1458.9222, 94.9108,0.0,1544.298, -48.0346,0.0309,842.1784, 124.4915,0.0,1589.3048, 109.8203,0.0309,-824.8988, 14.523,0.0,1417.8452, 14.4702,0.0,128.7274, 98.3053,0.0,1578.074, 24.7456,0.0309,-31.8985, -194.1687,0.0309,1583.7427, 146.1958,0.0309,-820.3747, 10.1418,0.0,40.0861, 33.7052,0.0,1059.4771, 125.096,0.0,1552.1423, 218.4121,0.0309,-785.0522, 117.7408,0.0309,-169.9927, 194.9371,0.0309,-1345.7676, 0.3493,0.0309,-739.1463, -40.5462,0.0309,54.1806, 198.2478,0.0309,-1189.6566, 60.6823,0.0309,-84.8343, -30.4307,0.0309,882.5303, 108.4334,0.0,98.9668, 6.7452,0.0309,-1238.4668, 126.2846,0.0,1487.2915, 148.4911,0.0,1472.1622, 136.1595,0.0309,-1294.8698, -35.2355,0.0218,-1282.3666, -25.6257,0.0309,936.3594, -54.8033,0.0214,-1328.3438, -189.6668,0.0309,1636.4679, 24.0225,0.0,946.2615, 245.4293,0.0309,-1135.5396, 111.266,0.0309,-231.5813, -165.8008,0.0309,1477.7354, 51.5269,0.0,1116.34, -69.9782,0.0309,430.4027, -130.8348,0.0309,1662.7562, 244.3756,0.0309,-1284.1815, 38.8517,0.0309,-483.7817, -62.675,0.0221,-1304.1547, 207.7508,0.0309,-1147.7346, -232.0194,0.0309,1710.7286, -63.8209,0.0309,703.1035, 67.0349,0.0,433.7927, 72.1111,0.0,1482.0723, -116.768,0.0309,890.3246, -5.5598,0.0308,-594.0276, 89.4615,0.0309,-1217.2479, 206.8634,0.0309,-995.3817, 129.0488,0.0309,-324.5187, -69.5794,0.0202,-1405.5171, 228.6789,0.0309,-896.7479, 19.7361,0.0309,-1126.1573, 189.9833,0.0309,-1277.3788, 126.3072,0.0309,-408.9595, 161.852,0.0309,-785.1769, -58.3921,0.0309,1262.259, -28.3083,0.0285,-935.2951, 68.3237,0.0,1596.8774, -133.9687,0.0246,-1262.3278, -87.5831,0.0309,916.3719, 21.7568,0.0309,-348.8102, 246.9633,0.0309,-1068.0763, -130.7782,0.0309,936.3252, 11.3362,0.0,83.9482, -167.5739,0.0309,1657.5095, 78.5605,0.0,1339.608, 211.7073,0.0309,-825.1395, -94.1914,0.0309,761.4807, -125.3026,0.0309,1605.8687, -18.7024,0.0309,423.3501, 120.9302,0.0309,-735.0588, 123.5322,0.0309,-547.0746, -47.9196,0.0245,-1161.1483, 138.5156,0.0309,-1102.2799, 238.7477,0.0309,-1311.9369, 31.6543,0.0309,-403.4401, 151.121,0.0309,-1047.2343, 86.1537,0.0,62.6075, -13.8961,0.0219,-1254.4946, -68.3001,0.0309,1589.2789, -85.3202,0.0309,723.3158, 139.069,0.0309,-286.3852, -138.1767,0.0309,1572.9581, -192.0032,0.0309,1436.9797, 42.3579,0.0,300.2809, 114.3405,0.0309,-27.8258, 50.8895,0.0,32.3038, -135.3144,0.0309,1501.8105, 168.1875,0.0309,-1175.1986, -173.4899,0.0309,1722.0741, 230.962,0.0309,-1182.9753, 45.2573,0.0309,-7.4028, 173.6795,0.0,1047.9286, 226.0435,0.0309,-1208.7529, 107.4481,0.0309,-452.0733, 47.3333,0.0,138.013, -95.2486,0.0309,1114.9658, 79.4753,0.0309,-1254.651, 93.5697,0.0,801.0468, 57.6376,0.0309,-715.9595, -26.6818,0.0309,692.7972, 72.0857,0.0309,-462.3348, -232.5921,0.0309,1491.5215, -46.2146,0.0303,-863.3472, -152.9639,0.0309,1285.0281, 71.9116,0.0,6.1119, 7.354,0.0309,-960.3834, -38.0389,0.0309,801.6433, 227.8235,0.0309,-681.5831, 148.5126,0.0309,-15.1374, -120.1476,0.0309,760.4372, 34.1489,0.0,571.1269, -37.6141,0.0309,650.7537, -163.2293,0.0309,1407.7887, -23.26,0.0309,89.6242, 172.7067,0.0309,-616.1572, -231.02,0.0309,1646.1558, -126.1293,0.0309,1294.3469, -17.9069,0.0245,-1127.0139, 32.912,0.0309,-1171.7191, -42.0619,0.0197,-1401.2715, 148.9735,0.0309,-497.656, -189.0913,0.0309,1292.3926, 149.1279,0.0,1506.8995, -110.9171,0.0309,1402.2874, -181.2676,0.0309,988.5276, 180.5981,0.0309,-1311.4183, -208.8542,0.0309,1661.2833, -59.1196,0.0309,935.9283, -156.6394,0.0309,1109.4359, 25.1067,0.0309,-761.6533, -244.6061,0.0309,1619.4591, -101.4241,0.0309,659.5424, 170.5114,0.0309,-1211.3849, 186.7272,0.0309,-1043.8767, 31.7494,0.0309,-916.4103, 121.7124,0.0309,-881.8651, -79.9493,0.0309,1063.0647, 103.0276,0.0309,-289.6597, 315.449,0.0309,-1155.162, 222.5345,0.0309,-942.2809, 83.2721,0.0309,-198.9164, 80.5205,0.0,166.5041, 204.539,0.0309,-857.572, -45.1234,0.0309,599.2081, 62.0637,0.0309,-156.7156, -83.3459,0.0309,960.04, 50.3426,0.0,101.0624, 96.8921,0.0,1265.6465, 40.9472,0.0309,-662.3583, -154.3013,0.0309,1541.3555, 140.593,0.0309,-1260.7134, 175.5045,0.0309,-670.8762, 225.7802,0.0309,-1036.2275, -220.9626,0.0309,1293.9612, 6.0428,0.0309,-1277.6619, 128.6589,0.0309,-1166.3201, -150.3859,0.0309,778.1994, -241.0561,0.0309,1407.272, 212.4789,0.0309,-1304.1691, 138.6457,0.0309,-616.2774, -73.1323,0.0309,1356.8458, -213.5785,0.0309,1615.2621, 159.5213,0.0309,-473.7868, -66.7765,0.0309,1179.6144, -184.7025,0.0309,1256.6273, 129.01,0.0309,-111.6397, -135.9163,0.0309,1044.9624, -5.3266,0.0309,-29.1292, 80.9976,0.0309,-33.6431, -64.4153,0.0309,979.1286, 264.6176,0.0309,-1311.1759, -115.7517,0.0309,1367.5287, -157.6108,0.0309,1685.614, 105.1903,0.0,1641.3971, 147.9526,0.0309,-1328.8992, 105.5806,0.0,1027.5068, 7.9294,0.0309,-1085.788, 86.5059,0.0309,-415.6966, 24.7472,0.0309,-723.2385, -208.3323,0.0309,1555.0632, 236.7455,0.0309,-1254.3065, 284.1978,0.0309,-1085.3851, 74.624,0.0309,-294.5153, 129.5711,0.0,916.7252, 17.7029,0.0309,-868.006, -101.8354,0.0309,1494.7585, 327.0823,0.0309,-1254.5781, 205.4456,0.0309,-1077.8574, -131.5016,0.0309,1344.0558, 290.5057,0.0309,-1328.4749, -136.6219,0.0309,1091.7083, 258.8217,0.0309,-1238.9288, 213.1959,0.0309,-1265.0791, 51.7262,0.0309,-50.1731, 44.0008,0.0,61.4903, 122.7655,0.0309,-768.1596, 119.6911,0.0309,-687.6739, -75.5372,0.0309,492.3133, -139.3807,0.0309,1195.1417, -88.7385,0.0309,1147.5833, -160.7339,0.0309,1601.476, 272.6089,0.0309,-1038.8915, 174.473,0.0309,-1087.246, -36.7554,0.0309,305.7394, -157.8948,0.0309,701.3972, 228.2672,0.0309,-964.3885, -108.2152,0.0309,993.2111, -116.5117,0.0309,1062.0701, 153.7587,0.0309,-907.9393, -157.1679,0.0267,-1190.3027, 28.379,0.0309,-129.321, 181.6234,0.0,1517.5826, -51.1541,0.0309,347.9309, -32.7218,0.0309,25.8307, 122.9558,0.0,1523.4869, -95.5004,0.0243,-1230.339, -117.4686,0.0226,-1350.0867, 153.7628,0.0,1384.0232, 41.0183,0.0,1471.1741, 148.6207,0.0309,-156.9717, 142.2088,0.0309,-64.1377, -101.3919,0.0309,1280.0104, -265.9518,0.0309,1337.0461, -124.0279,0.0309,1257.3915, 92.0061,0.0309,-329.5485, 123.5473,0.0,1422.115, 22.1258,0.0,234.5697, 248.4192,0.0309,-997.3826, 73.9634,0.0,1017.5784, 138.5247,0.0,33.4105, -3.4577,0.0226,-1208.2318, -182.3166,0.0309,1506.7476, 184.4275,0.0309,-735.7841, -56.6966,0.0309,1040.2112, -125.67,0.0309,681.9171, 23.0712,0.0309,-1207.6434, -238.935,0.0309,1675.4131, -53.9855,0.0309,1301.3658, -225.3006,0.0309,1585.6509, 312.8372,0.0309,-1114.4163, 32.2795,0.0,1612.5942, 145.6242,0.0,1301.3866, -94.7584,0.0226,-1314.0216, -15.9424,0.0212,-1291.684, 52.9151,0.0,231.7185, 48.6211,0.0,168.317, 50.6072,0.0,395.1082, 76.0417,0.0,1514.9249, -96.1966,0.0309,1606.7633, -12.8074,0.0309,-336.7975, -52.0115,0.0234,-1224.6272, -149.6235,0.0309,1147.924, 105.5288,0.0309,-68.6073, -113.188,0.0309,958.7141, -275.4464,0.0309,1670.0601, 57.2352,0.0309,-1281.8784, -70.2692,0.0309,771.6522, 64.3506,0.0,271.3841, -78.9726,0.026,-1125.0801, -80.2648,0.0218,-1339.9636, -73.7187,0.0309,1009.1139, 6.4594,0.0309,-1316.7391, -65.4156,0.0298,-911.6061, -153.7144,0.0309,1628.4749, 122.9467,0.0309,-198.8111, 133.9229,0.0,949.0271, -15.9599,0.0192,-1394.0874, -125.6463,0.0309,1696.387, -95.0344,0.0293,-972.7617, -49.6549,0.0309,461.6572, 94.4728,0.0309,-106.2316, 177.9042,0.0309,-548.9158, 151.3954,0.0,1535.3042, 39.4945,0.0309,-219.3219, -193.5245,0.0309,1680.7058, -102.2584,0.0309,625.2022, 104.2186,0.0,189.8748, 139.9327,0.0,1622.849, -43.7148,0.0309,734.9761, 190.4697,0.0309,-1116.1177, -101.9526,0.0309,1088.9314, 122.1711,0.0,230.8497, -21.2236,0.0309,-439.7933, 162.6233,0.0,1096.3604, 72.7443,0.0,1285.8374, -149.8377,0.0309,968.2503, 70.571,0.0,364.2043, 169.0714,0.0,1488.7125, 151.8182,0.0,1568.8035, -55.7211,0.0309,-127.9772, -68.5685,0.0309,807.0244, -126.4097,0.0309,1440.4734, -144.4758,0.0309,1381.5548, -65.3687,0.0291,-948.6236, 56.8317,0.0,839.2228, -151.8487,0.0255,-1303.8488, 277.5326,0.0309,-1158.9056, -85.303,0.0251,-1175.9631, 133.8307,0.0,1128.6833, 153.6215,0.0309,-222.5052, 213.0148,0.0,1542.0648, 194.3257,0.0,1344.2549, 155.442,0.0,1439.9865, -34.5376,0.0212,-1313.2687, 117.5956,0.0,822.915, 228.9224,0.0309,-721.4219, -62.4549,0.028,-1002.9484, -14.7807,0.0234,-1180.8033, 155.2791,0.0,1339.9369, 0.3495,0.0255,-1055.7629, -57.3261,0.0273,-1029.0758, 88.8363,0.0,721.4096, 243.927,0.0309,-1338.5792, -128.016,0.0227,-1437.5886, -56.1685,0.0225,-1273.7158, 254.3293,0.0309,-1210.5342, 177.4276,0.0,1610.8788, 61.8223,0.0,1542.0615, -60.2284,0.0309,-549.6321, 239.9711,0.0309,-1104.4557, -31.9689,0.0233,-1205.3507, 81.1611,0.0,986.6481, -186.2551,0.0309,1608.9277, -24.2803,0.0186,-1433.3472, 115.5464,0.0,1220.8749, -68.0719,0.0209,-1370.2146, -7.5925,0.0267,-1002.6639, 97.1899,0.0,1485.1656, -82.5488,0.0228,-1288.0715, -10.9792,0.0309,641.1585, 17.1353,0.0309,-445.9182, 9.63,0.0309,-245.6392, 112.0881,0.0,1345.673, 132.6625,0.0,1028.4077, 38.8006,0.0,1000.2794, -196.7684,0.0309,1346.423, 109.9497,0.0,1304.3684, -27.35,0.0226,-1236.2242, 118.1097,0.0,615.4873, 42.1947,0.0,877.1704, 47.8986,0.0,915.2786, -58.0187,0.0309,-302.2948, -164.9484,0.0269,-1247.8785, -19.6482,0.0309,-134.3755, 33.945,0.0,1293.7214, 108.6325,0.0,1151.5352, -55.4124,0.0309,-601.9572, 109.3682,0.0,753.8525, 98.5273,0.0,648.354, 25.8628,0.0309,-308.919, 106.9537,0.0,1463.053, 51.8261,0.0,1427.8076, -55.0168,0.0256,-1113.1647, 30.9679,0.0309,-98.0266, -117.694,0.0236,-1291.2881, 56.6668,0.0,691.0779, 53.6467,0.0,795.0153, -5.5666,0.0309,-174.3179, -42.3444,0.0225,-1255.198, -88.5735,0.0236,-1256.922, 54.4153,0.0,1153.6332, 92.0823,0.0,889.8616, 101.6093,0.0,1384.1783, 26.3426,0.0309,-619.5081, -42.2809,0.0309,-493.978, 72.3453,0.0,1239.2573, -6.0134,0.0309,-540.4188, -31.9463,0.0308,-725.8403, 19.188,0.0309,-66.3654, -13.0619,0.0308,-692.7062, 80.3498,0.0,220.2531, -29.8916,0.0309,-5.5098, 49.3726,0.0,725.9321, 108.5672,0.0,1110.3125, 83.4223,0.0,614.1436, 99.3178,0.0,684.0179, 21.4917,0.0309,-170.2276, 126.419,0.0,579.4589, 73.0821,0.0,766.3069, 111.3565,0.0,970.9427, 151.6464,0.0,882.6736, -13.537,0.0309,-277.3482, -7.2006,0.0309,-496.1304, 186.2576,0.0309,-907.7623, 67.2002,0.0,529.7164, 71.4441,0.0,582.0921, -44.677,0.0309,-242.3667, -27.656,0.0309,-52.4307, -40.0078,0.0309,-84.9021, -171.3656,0.0252,-1541.1433, 65.2926,0.0,656.6734, 180.3852,0.0309,-955.2371, -67.1274,0.0186,-1484.1785, -35.9353,0.0179,-1483.9939, -24.2957,0.017,-1517.533, -94.232,0.0197,-1495.3425, 91.8248,0.0,264.9274, -102.6966,0.0213,-1392.9041, -5.0638,0.0309,-101.4705, 141.0118,0.0,537.5858, 127.7822,0.0,494.8495, 94.2597,0.0,560.1642, -116.2242,0.0212,-1521.142, 95.547,0.0,403.08, 128.832,0.0,712.8452, -83.3105,0.0186,-1535.111, 111.1693,0.0,527.6302, -126.7166,0.0218,-1550.5571, 17.1482,0.0,683.2355, -95.2447,0.0202,-1445.3323, -146.6421,0.0237,-1488.4318, -56.1945,0.0193,-1436.4421, 138.0596,0.0,769.5013],
            "N":[0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0]
        }
    }
};