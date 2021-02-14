package main

import (
	"os"

	"github.com/uplo-tech/Uplo/modules"
	"github.com/uplo-tech/Uplo/node/api"

	"github.com/OneOfOne/struct2ts"
)

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func main() {
	converter := struct2ts.New(&struct2ts.Options{
		InterfaceOnly: true,
	})

	converter.Add(modules.ValuedTransaction{})
	converter.Add(modules.ProcessedTransaction{})
	converter.Add(api.ConsensusGET{})
	converter.Add(api.GatewayGET{})
	converter.Add(api.DaemonVersion{})
	converter.Add(api.WalletGET{})
	converter.Add(api.WalletInitPOST{})
	converter.Add(api.RenterContracts{})
	converter.Add(api.RenterGET{})
	converter.Add(api.RenterRecoveryStatusGET{})
	converter.Add(api.UploConstants{})
	converter.Add(api.RenterFiles{})
	converter.Add(api.RenterFile{})
	converter.Add(api.RenterDirectory{})
	f, err := os.Create("./src/models/models.ts")
	check(err)
	defer f.Close()

	err = converter.RenderTo(f)
	f.Sync()
	check(err)
}
